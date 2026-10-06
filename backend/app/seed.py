"""Seed the database with realistic starting content.

Everything written here is editable from the admin panel — it exists so the
site looks finished on first boot, not because any of it is fixed. Replace it
with Emmanuel's real details through /admin.

Run:  python -m app.seed          (skips if content already exists)
      python -m app.seed --force  (wipes content tables and reseeds)
"""

from __future__ import annotations

import sys
from datetime import date, datetime, timezone

from slugify import slugify
from sqlalchemy import delete, select

from app.config import settings
from app.core.sanitize import reading_minutes
from app.core.security import hash_password
from app.database import Base, SessionLocal, engine
from app.models import (
    blog_post_tags,
    BlogCategory,
    BlogPost,
    BlogTag,
    Certification,
    Education,
    Experience,
    ExperienceAchievement,
    ExpertiseArea,
    Profile,
    ProfileStat,
    Project,
    ProjectMedia,
    SiteSettings,
    Skill,
    SkillCategory,
    SocialLink,
    Testimonial,
    User,
)

# --------------------------------------------------------------------------
# Icon sources
#
# Devicon carries full-colour logos for almost the whole data stack and is the
# default. Iconify's "logos" set fills the brand gaps Devicon lacks. Simple
# Icons is monochrome, so those are tinted with the brand gold to sit in the
# palette rather than clashing with it.
#
# A handful of tools (XGBoost, LightGBM) have no official mark anywhere; those
# are left without a URL and the site renders a lettered tile instead. Nothing
# ever falls back to an emoji.
# --------------------------------------------------------------------------
DEVICON = "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/{0}/{0}-{1}.svg"
LOGOS = "https://api.iconify.design/logos:{}.svg"
SIMPLE = "https://cdn.simpleicons.org/{}/f5b426"


def devicon(name: str, variant: str = "original") -> str:
    return DEVICON.format(name, variant)


def logos(name: str) -> str:
    return LOGOS.format(name)


def simple(slug: str) -> str:
    """Monochrome Simple Icons mark, tinted to the brand gold."""
    return SIMPLE.format(slug)


# --------------------------------------------------------------------------
# Skills — grouped by the categories in §12
# (name, icon url or None, official site)
# --------------------------------------------------------------------------
SKILL_TREE: dict[str, list[tuple[str, str | None, str]]] = {
    "Programming and Data": [
        ("Python", devicon("python"), "https://www.python.org"),
        ("R", devicon("r"), "https://www.r-project.org"),
        ("pandas", devicon("pandas"), "https://pandas.pydata.org"),
        ("NumPy", devicon("numpy"), "https://numpy.org"),
        ("Polars", simple("polars"), "https://pola.rs"),
        ("Apache Spark", devicon("apachespark"), "https://spark.apache.org"),
    ],
    "Machine Learning": [
        ("scikit-learn", devicon("scikitlearn"), "https://scikit-learn.org"),
        ("XGBoost", None, "https://xgboost.readthedocs.io"),
        ("LightGBM", None, "https://lightgbm.readthedocs.io"),
        ("MLflow", simple("mlflow"), "https://mlflow.org"),
        ("Optuna", simple("optuna"), "https://optuna.org"),
    ],
    "Deep Learning": [
        ("TensorFlow", devicon("tensorflow"), "https://www.tensorflow.org"),
        ("PyTorch", devicon("pytorch"), "https://pytorch.org"),
        ("Keras", devicon("keras"), "https://keras.io"),
        ("Hugging Face", logos("hugging-face-icon"), "https://huggingface.co"),
        ("OpenCV", devicon("opencv"), "https://opencv.org"),
    ],
    "Data Visualization": [
        ("Tableau", logos("tableau-icon"), "https://www.tableau.com"),
        ("Power BI", logos("microsoft-power-bi"), "https://powerbi.microsoft.com"),
        ("Plotly", devicon("plotly"), "https://plotly.com"),
        ("Matplotlib", devicon("matplotlib"), "https://matplotlib.org"),
        ("Streamlit", devicon("streamlit"), "https://streamlit.io"),
    ],
    "AI and LLMs": [
        ("OpenAI", logos("openai-icon"), "https://platform.openai.com"),
        ("LangChain", simple("langchain"), "https://www.langchain.com"),
        ("Pinecone", logos("pinecone-icon"), "https://www.pinecone.io"),
        ("Ollama", simple("ollama"), "https://ollama.com"),
    ],
    "Cloud and Deployment": [
        ("AWS", logos("aws"), "https://aws.amazon.com"),
        ("Google Cloud", devicon("googlecloud"), "https://cloud.google.com"),
        ("Azure", devicon("azure"), "https://azure.microsoft.com"),
        ("Docker", devicon("docker"), "https://www.docker.com"),
        ("FastAPI", devicon("fastapi"), "https://fastapi.tiangolo.com"),
        ("Airflow", devicon("apacheairflow"), "https://airflow.apache.org"),
    ],
    "Databases": [
        ("PostgreSQL", devicon("postgresql"), "https://www.postgresql.org"),
        ("MySQL", devicon("mysql"), "https://www.mysql.com"),
        ("MongoDB", devicon("mongodb"), "https://www.mongodb.com"),
        ("BigQuery", simple("googlebigquery"), "https://cloud.google.com/bigquery"),
        ("DuckDB", simple("duckdb"), "https://duckdb.org"),
        ("Redis", devicon("redis"), "https://redis.io"),
    ],
    "Developer Tools": [
        ("Git", devicon("git"), "https://git-scm.com"),
        ("GitHub", devicon("github"), "https://github.com"),
        ("Jupyter", devicon("jupyter"), "https://jupyter.org"),
        ("VS Code", devicon("vscode"), "https://code.visualstudio.com"),
        ("Linux", devicon("linux"), "https://www.linux.org"),
        ("Bash", devicon("bash"), "https://www.gnu.org/software/bash/"),
    ],
}


EXPERIENCE = [
    {
        "title": "Senior Data Scientist",
        "organization": "Sokoni Analytics",
        "employment_type": "Full-time",
        "location": "Nairobi, Kenya",
        "start_date": date(2023, 3, 1),
        "current": True,
        "description": (
            "Lead the forecasting and risk modelling practice for a team serving "
            "agricultural lenders and commodity traders across East Africa. Own "
            "models end to end, from problem framing with the lending team to the "
            "monitoring dashboards that flag drift in production."
        ),
        "technologies": "Python, PostgreSQL, XGBoost, Airflow, AWS, MLflow, Docker",
        "achievements": [
            "Cut default rates on the smallholder lending book by 23% by replacing a rules engine with a gradient-boosted risk model and an explainability layer loan officers actually read.",
            "Built the yield forecasting pipeline now used for 40,000+ farm plots, combining Sentinel-2 imagery with local weather station data.",
            "Reduced model retraining from a two-day manual process to a scheduled Airflow DAG running in under 40 minutes.",
            "Mentored three junior data scientists through their first production deployments.",
        ],
    },
    {
        "title": "Data Scientist",
        "organization": "Mradi Health Data Lab",
        "employment_type": "Full-time",
        "location": "Nairobi, Kenya",
        "start_date": date(2021, 1, 1),
        "end_date": date(2023, 2, 28),
        "description": (
            "Worked with ministry and county health teams on supply chain and "
            "epidemiological analytics, turning fragmented facility reporting into "
            "forecasts the procurement team could act on."
        ),
        "technologies": "Python, R, PostgreSQL, scikit-learn, Power BI, GeoPandas",
        "achievements": [
            "Built a stockout early-warning model covering 1,200 health facilities that gave procurement 3 weeks of lead time, up from reactive ordering.",
            "Designed the data quality scoring framework adopted across 12 county reporting pipelines.",
            "Published two internal method notes on handling reporting lag in facility-level time series.",
        ],
    },
    {
        "title": "Data Analyst",
        "organization": "Tuvute Insights",
        "employment_type": "Full-time",
        "location": "Nairobi, Kenya",
        "start_date": date(2019, 6, 1),
        "end_date": date(2020, 12, 31),
        "description": (
            "Analytics for consumer research clients across retail and telco. Heavy "
            "SQL, survey methodology, and the dashboards that made the findings stick."
        ),
        "technologies": "SQL, Python, Tableau, Excel, Google BigQuery",
        "achievements": [
            "Automated a monthly reporting pack that had taken two analysts four days, freeing roughly 60 analyst-days a year.",
            "Segmented a 90,000-respondent panel into six behavioural clusters that shaped a national retail client's 2020 pricing strategy.",
        ],
    },
    {
        "title": "Data Science Mentor",
        "organization": "LuxDevHQ",
        "employment_type": "Part-time",
        "location": "Remote",
        "start_date": date(2022, 5, 1),
        "current": True,
        "description": (
            "Mentor early-career data professionals through applied projects, code "
            "review, and portfolio feedback. Most of what I write on this site starts "
            "as a question someone asked in a session."
        ),
        "technologies": "Python, SQL, scikit-learn, Git",
        "achievements": [
            "Mentored 40+ learners, with the majority moving into analyst or data engineering roles within a year.",
            "Wrote the applied machine learning track still used in the programme.",
        ],
    },
]


EDUCATION = [
    {
        "institution": "University of Nairobi",
        "degree": "MSc, Data Science",
        "field_of_study": "Statistical learning and computational methods",
        "start_date": date(2019, 9, 1),
        "graduation_date": date(2021, 11, 1),
        "description": (
            "Thesis on spatial-temporal models for crop yield prediction using "
            "multispectral satellite imagery across Kenyan counties."
        ),
    },
    {
        "institution": "Kenyatta University",
        "degree": "BSc, Statistics",
        "field_of_study": "Statistics and programming",
        "start_date": date(2014, 9, 1),
        "graduation_date": date(2018, 8, 1),
        "description": "First Class Honours. Final year project on survey non-response modelling.",
    },
]


PROJECTS = [
    {
        "title": "Maize yield forecasting from satellite imagery",
        "excerpt": (
            "A county-level yield model combining Sentinel-2 vegetation indices with "
            "ground weather data, built to give lenders a harvest estimate eight weeks "
            "before it happens."
        ),
        "category": "Machine Learning",
        "technologies": "Python, XGBoost, Google Earth Engine, GeoPandas, Airflow, PostgreSQL",
        "github_url": "https://github.com/example/maize-yield-forecast",
        "live_url": "",
        "featured": True,
        "completion_date": date(2024, 8, 1),
        "problem": (
            "<p>Agricultural lenders in East Africa set credit limits months before "
            "they know what the harvest will look like. The existing approach — last "
            "season's yield, adjusted by a loan officer's judgement — was wrong often "
            "enough that the portfolio carried a large, poorly-priced weather risk.</p>"
        ),
        "solution": (
            "<p>A gradient-boosted model that predicts plot-level yield eight weeks "
            "ahead of harvest, using vegetation indices extracted from Sentinel-2 "
            "imagery alongside rainfall and temperature series from the nearest "
            "weather stations.</p><p>The output feeds directly into the credit "
            "limit calculation, with a prediction interval rather than a point "
            "estimate so the lending team can price the uncertainty instead of "
            "ignoring it.</p>"
        ),
        "dataset": (
            "<p>Four seasons of ground-truth yield measurements from 2,100 surveyed "
            "plots, joined to Sentinel-2 L2A composites at 10m resolution and daily "
            "observations from 68 weather stations. Roughly 380,000 plot-week "
            "observations after the temporal join.</p>"
        ),
        "methodology": (
            "<p>Vegetation indices (NDVI, EVI, NDWI) were aggregated into "
            "phenology-aware windows rather than fixed calendar months, because "
            "planting dates vary by up to six weeks across the study area. Weather "
            "features used cumulative growing degree days and a dry-spell counter.</p>"
            "<p>Validation was blocked by season and by county — a random split "
            "leaked badly, inflating R² by about 0.2 through spatial "
            "autocorrelation between neighbouring plots.</p>"
        ),
        "models_used": (
            "<p>XGBoost with quantile regression objectives at the 10th, 50th and "
            "90th percentiles for the prediction interval. Benchmarked against ridge "
            "regression, random forest, and a LSTM on the raw index series — the "
            "LSTM matched XGBoost's median accuracy but was substantially harder to "
            "explain to the credit committee, so it did not ship.</p>"
        ),
        "results": (
            "<p>Median absolute error of 0.34 t/ha against a baseline of 0.71 t/ha, "
            "held out across two unseen seasons. The 80% prediction interval had "
            "empirical coverage of 78%, close enough to be usable for pricing.</p>"
            "<p>Now running on 40,000+ plots each season.</p>"
        ),
    },
    {
        "title": "Explainable credit risk scoring for smallholder lending",
        "excerpt": (
            "A risk model that replaced a rules engine, paired with a SHAP-based "
            "explanation layer that loan officers use during the actual conversation "
            "with an applicant."
        ),
        "category": "Machine Learning",
        "technologies": "Python, LightGBM, SHAP, FastAPI, PostgreSQL, Docker",
        "github_url": "https://github.com/example/credit-risk-explainable",
        "live_url": "",
        "featured": True,
        "completion_date": date(2024, 2, 1),
        "problem": (
            "<p>The lending decision ran on a 40-rule scorecard written in 2018. It "
            "was stable and completely opaque: nobody could say why a given applicant "
            "was declined, which made both appeals and regulatory review painful.</p>"
        ),
        "solution": (
            "<p>A LightGBM classifier serving probability of default, wrapped in a "
            "FastAPI service that returns the score alongside the four features "
            "pushing it furthest in each direction, phrased in language a loan "
            "officer can say out loud.</p>"
        ),
        "methodology": (
            "<p>The hard part was not the model. It was the target definition: "
            "'default' had three incompatible definitions across the business. "
            "Settling on 90 days past due at 12 months, and rebuilding history to "
            "match, took longer than the modelling.</p>"
            "<p>Class imbalance (4.2% positive) was handled with scale_pos_weight "
            "rather than resampling, which kept the predicted probabilities "
            "calibrated enough to use directly in pricing.</p>"
        ),
        "models_used": (
            "<p>LightGBM with monotonic constraints on income and repayment-history "
            "features — without them the model learned locally non-monotonic "
            "relationships that were statistically real but impossible to defend in "
            "an appeal.</p>"
        ),
        "results": (
            "<p>AUC 0.81 against the scorecard's 0.68. More importantly, default "
            "rates on the book dropped 23% at constant approval volume. Appeal "
            "resolution time fell from days to minutes because the reason was "
            "already on the screen.</p>"
        ),
    },
    {
        "title": "Swahili–English sentiment classifier",
        "excerpt": (
            "A fine-tuned transformer for code-switched social text, trained on a "
            "hand-labelled corpus because nothing off the shelf handled Sheng."
        ),
        "category": "Deep Learning",
        "technologies": "Python, PyTorch, Hugging Face, Transformers, Weights & Biases",
        "github_url": "https://github.com/example/swahili-sentiment",
        "live_url": "https://example.com/swahili-sentiment-demo",
        "featured": True,
        "completion_date": date(2023, 11, 1),
        "problem": (
            "<p>Off-the-shelf sentiment models score Kenyan social media text close "
            "to randomly. The text is code-switched — Swahili, English and Sheng "
            "inside a single sentence — and the sarcasm markers are entirely "
            "different from the English-language training data these models saw.</p>"
        ),
        "solution": (
            "<p>A fine-tuned multilingual transformer trained on 14,000 posts "
            "labelled by three annotators, with disagreements adjudicated rather "
            "than averaged away.</p>"
        ),
        "dataset": (
            "<p>14,200 public posts, stratified across topic and time. Inter-annotator "
            "agreement (Krippendorff's α) was 0.71 — respectable for sentiment, and "
            "an honest ceiling on what the model could be expected to reach.</p>"
        ),
        "models_used": (
            "<p>AfriBERTa and XLM-RoBERTa base, both fine-tuned. XLM-R won by about "
            "3 points F1, likely because the code-switched English carries more "
            "signal than a purely African-language pretraining corpus captures.</p>"
        ),
        "results": (
            "<p>Macro F1 of 0.76 against 0.41 for the best off-the-shelf baseline. "
            "Error analysis showed most remaining failures were genuine annotator "
            "edge cases rather than model failures.</p>"
        ),
    },
    {
        "title": "Health facility stockout early warning",
        "excerpt": (
            "A forecasting system covering 1,200 facilities that turned reactive "
            "drug procurement into a three-week planning window."
        ),
        "category": "Analytics",
        "technologies": "Python, scikit-learn, PostgreSQL, Power BI, Prophet",
        "github_url": "https://github.com/example/stockout-early-warning",
        "live_url": "",
        "featured": False,
        "completion_date": date(2022, 9, 1),
        "problem": (
            "<p>Facilities reported stock levels monthly, and often late. By the time "
            "a stockout appeared in a report, it had usually been running for weeks.</p>"
        ),
        "solution": (
            "<p>A per-facility, per-commodity consumption forecast, combined with a "
            "classifier estimating the probability of a stockout in the next 30 days. "
            "Facilities above the threshold appear on a county-level dashboard ranked "
            "by population served.</p>"
        ),
        "methodology": (
            "<p>Reporting lag was the central modelling problem — a missing report is "
            "not a zero, and treating it as one made early versions confidently "
            "wrong. Missingness was modelled explicitly as a feature, since a "
            "facility that stops reporting is often a facility in trouble.</p>"
        ),
        "results": (
            "<p>Precision of 0.68 at 30-day horizon with recall of 0.74 — deliberately "
            "tuned toward recall, because the cost of a missed stockout is far higher "
            "than the cost of an unnecessary check-in call.</p>"
        ),
    },
    {
        "title": "Retail demand clustering and price elasticity",
        "excerpt": (
            "Behavioural segmentation across a 90,000-respondent panel, and the "
            "elasticity estimates that came out of it."
        ),
        "category": "Analytics",
        "technologies": "Python, SQL, BigQuery, scikit-learn, Tableau",
        "github_url": "https://github.com/example/retail-elasticity",
        "live_url": "",
        "featured": False,
        "completion_date": date(2020, 10, 1),
        "problem": (
            "<p>A national retail client priced uniformly across very different "
            "catchment areas, with no view of which customers were actually "
            "price-sensitive.</p>"
        ),
        "solution": (
            "<p>Six behavioural clusters derived from purchase frequency, basket "
            "composition and promotion response, with elasticity estimated per "
            "cluster and category.</p>"
        ),
        "results": (
            "<p>Two clusters covering 31% of revenue turned out to be almost entirely "
            "price-insensitive within the tested range — which changed the promotional "
            "calendar more than any model coefficient did.</p>"
        ),
    },
]


BLOG_CATEGORIES = [
    ("Machine Learning", "Model building, validation, and the parts that go wrong", "gold"),
    ("Deep Learning", "Neural networks, transformers, and training at small scale", "plum"),
    ("Data Engineering", "Pipelines, warehouses, and moving data reliably", "indigo"),
    ("Career", "Notes from mentoring and hiring in data roles", "palm"),
]


BLOG_POSTS = [
    {
        "title": "Your churn model's AUC is lying to you",
        "category": "Machine Learning",
        "tags": ["evaluation", "churn", "metrics"],
        "featured": True,
        "excerpt": (
            "A model with 0.89 AUC that loses money is more common than it should be. "
            "The problem is usually not the model — it is that AUC answers a question "
            "nobody in the business asked."
        ),
        "published_at": datetime(2025, 6, 18, 9, 0, tzinfo=timezone.utc),
        "content": """
<p>I have now watched four separate teams ship a churn model with a healthy AUC and
then quietly stop using it within two quarters. The pattern is consistent enough
to be worth writing down.</p>

<h2>What AUC actually measures</h2>

<p>AUC is the probability that a randomly chosen positive case scores higher than a
randomly chosen negative one. It is a ranking metric, evaluated across every
possible threshold, weighting all of them equally.</p>

<p>That last part is the problem. You do not deploy across every threshold. You
deploy at one. And the thresholds where you actually operate — the top 5% of
customers by risk, say, because that is how many the retention team can call —
contribute almost nothing to the AUC number.</p>

<blockquote>A model can be excellent at separating the middle of the distribution
and mediocre at the top, and AUC will tell you it is excellent.</blockquote>

<h2>What to look at instead</h2>

<p>Start from capacity. If the retention team can contact 500 customers a month,
the only question that matters is: of the 500 highest-scoring customers, how many
would actually have churned?</p>

<pre><code class="language-python">import numpy as np

# Precision among the k highest-scoring cases.
# k should be the number of interventions you can actually make,
# not a round number that looks nice in a slide.
def precision_at_k(y_true, y_score, k):
    order = np.argsort(y_score)[::-1][:k]
    return y_true[order].mean()


for k in (100, 250, 500, 1000):
    print(f"P@{k:>4}: {precision_at_k(y_test, probs, k):.3f}")
</code></pre>

<p>Run that for your current model and the baseline it replaced. I have seen the
gap close to nothing more than once, on models whose AUC differed by 0.08.</p>

<h2>The second problem: churn is not the outcome</h2>

<p>Even precision@k assumes that identifying a churner is the goal. It is not. The
goal is to <em>prevent</em> churn, which means the useful customer is one who will
churn <em>and</em> would respond to the intervention.</p>

<p>Those are different populations. Customers who have definitively decided to
leave score highest and are the least persuadable. A model optimised purely for
churn probability systematically concentrates your retention budget on the people
least likely to be moved by it.</p>

<p>The fix is uplift modelling, which needs experimental data — a genuine holdout
where you deliberately did not intervene. If you do not have that, the honest
answer is that you cannot yet tell whether the model is helping, and the first
thing to build is the experiment, not a better classifier.</p>

<h2>What I do now</h2>

<ul>
<li>Report precision@k at the team's real capacity, and the baseline's precision at the same k.</li>
<li>Report calibration, because scores get used as probabilities whether or not they are.</li>
<li>Reserve a permanent untreated holdout, even at the cost of some churn.</li>
<li>Report AUC last, if at all.</li>
</ul>

<p>None of this makes the model better. It makes the reporting honest, which in
my experience is what determines whether the model survives contact with the
business.</p>
""",
    },
    {
        "title": "Fine-tuning a Swahili sentiment model on one GPU",
        "category": "Deep Learning",
        "tags": ["nlp", "transformers", "low-resource"],
        "featured": True,
        "excerpt": (
            "What it takes to get usable results on code-switched African-language "
            "text without a cluster, and where the effort actually goes — which is "
            "not where I expected."
        ),
        "published_at": datetime(2025, 4, 2, 8, 30, tzinfo=timezone.utc),
        "content": """
<p>The short version: the modelling took two days, the data took six weeks, and
the model is only as good as the second number.</p>

<h2>Why off-the-shelf models fail here</h2>

<p>Kenyan social media text is code-switched. A single sentence moves between
Swahili, English and Sheng, and the sentiment markers travel with the language
being used at that moment. Multilingual models handle the individual languages
reasonably. They handle the switching badly, because switching itself carries
meaning — moving into Sheng mid-sentence often marks sarcasm.</p>

<p>An off-the-shelf multilingual sentiment model scored macro F1 of 0.41 on my
test set. Three classes. Random is 0.33.</p>

<h2>Annotation is the project</h2>

<p>Three annotators, 14,200 posts, explicit adjudication of disagreements rather
than majority vote. Krippendorff's α came out at 0.71.</p>

<p>That number is worth sitting with. It is a ceiling. If three fluent speakers
agree only 71% of the time beyond chance, a model reaching 0.85 is not
outperforming humans — it is overfitting to one annotator's habits.</p>

<h2>The training loop</h2>

<pre><code class="language-python">from transformers import (
    AutoModelForSequenceClassification,
    AutoTokenizer,
    TrainingArguments,
    Trainer,
)

MODEL = "xlm-roberta-base"
tokenizer = AutoTokenizer.from_pretrained(MODEL)
model = AutoModelForSequenceClassification.from_pretrained(MODEL, num_labels=3)

args = TrainingArguments(
    output_dir="./out",
    learning_rate=2e-5,
    per_device_train_batch_size=16,
    gradient_accumulation_steps=2,   # effective batch 32 on a 16GB card
    num_train_epochs=4,
    warmup_ratio=0.1,
    fp16=True,
    eval_strategy="epoch",
    save_strategy="epoch",
    load_best_model_at_end=True,
    metric_for_best_model="eval_macro_f1",
)
</code></pre>

<p>Nothing exotic. <code>fp16</code> and gradient accumulation are what make it fit
on a single 16GB card; everything else is close to the library defaults, and I
tried a fair number of alternatives that were not better.</p>

<h2>AfriBERTa vs XLM-R</h2>

<p>I expected AfriBERTa to win — it is pretrained on African languages, this is an
African-language task. It lost by about 3 points macro F1.</p>

<p>My reading is that the English in the code-switched text carries more of the
sentiment signal than I assumed, and XLM-R's much larger English exposure
outweighs AfriBERTa's Swahili advantage. I am not certain of that. It is the
explanation that best fits the per-example errors.</p>

<h2>Where it landed</h2>

<p>Macro F1 0.76, against 0.41 for the best off-the-shelf baseline and an
annotator ceiling somewhere around 0.80. Most remaining errors are examples the
annotators also argued about.</p>

<p>If you are starting something similar: budget for annotation, measure your
agreement before you train anything, and treat that agreement number as the score
you are actually competing with.</p>
""",
    },
    {
        "title": "Reading SHAP values without fooling yourself",
        "category": "Machine Learning",
        "tags": ["explainability", "shap", "interpretation"],
        "featured": False,
        "excerpt": (
            "SHAP tells you what the model did. It is routinely read as telling you "
            "what is true about the world. Those come apart in specific, predictable "
            "ways."
        ),
        "published_at": datetime(2025, 2, 11, 7, 45, tzinfo=timezone.utc),
        "content": """
<p>SHAP has become the default answer to "why did the model say that", and it is a
good answer. The failure is in what people do with it next.</p>

<h2>The distinction that matters</h2>

<p>A SHAP value is an attribution of a model's output to its inputs. It is a fact
about the model. It becomes a claim about the world only if the model happens to
have learned the world correctly, which is exactly the thing you were trying to
check.</p>

<p>Concretely: if <code>distance_to_branch</code> has a large SHAP value, that
means the model leans on it heavily. It does not mean distance causes default. In
our credit data, distance was mostly a proxy for which loan officer originated the
file — and officer quality varied a lot.</p>

<h2>Correlated features split credit arbitrarily</h2>

<p>When two features carry the same information, SHAP divides the attribution
between them in a way that depends on the sampling, not on any fact about
importance. Run it twice with different background sets and the split moves.</p>

<pre><code class="language-python">import shap

# Check stability before trusting any single ranking.
rankings = []
for seed in range(5):
    background = X_train.sample(200, random_state=seed)
    explainer = shap.TreeExplainer(model, data=background)
    values = explainer.shap_values(X_test.sample(500, random_state=seed))
    rankings.append(np.abs(values).mean(axis=0).argsort()[::-1][:10])

# If the top-10 sets differ much across seeds, the ranking is not a finding.
</code></pre>

<p>I now run this before putting a SHAP plot in front of anyone. On one model the
top three features were stable and positions 4 through 9 shuffled freely; we
presented three features.</p>

<h2>Global plots hide subgroup reversals</h2>

<p>A summary plot averages across your population. A feature can push risk up for
one subgroup and down for another and show a near-zero mean effect. Always look at
dependence plots for the segments you actually care about.</p>

<h2>What I tell people now</h2>

<ul>
<li>SHAP is a debugging tool first and a communication tool second.</li>
<li>Check ranking stability across background samples before presenting a ranking.</li>
<li>Say "the model relies on X", never "X causes Y".</li>
<li>If a SHAP finding surprises the domain expert, the default hypothesis is leakage, not insight.</li>
</ul>

<p>That last one has caught three leaks for me. In each case the feature was
genuinely predictive, genuinely available at training time, and genuinely
unavailable at the moment the prediction needed to be made.</p>
""",
    },
    {
        "title": "The data quality work nobody puts on a roadmap",
        "category": "Data Engineering",
        "tags": ["data-quality", "pipelines", "practice"],
        "featured": False,
        "excerpt": (
            "Every pipeline I have inherited had the same four problems. None of them "
            "were interesting, and all of them were load-bearing."
        ),
        "published_at": datetime(2024, 11, 20, 10, 15, tzinfo=timezone.utc),
        "content": """
<p>Across health facility reporting, agricultural surveys and retail panels, the
same four failures show up. They are boring, which is precisely why they survive.</p>

<h2>1. Missing is not zero</h2>

<p>A facility that did not report has not dispensed zero units. Filling with zero
converts silence into a strong, wrong signal — and because missingness usually
correlates with the thing you are predicting, it does so in the worst direction.</p>

<p>Model missingness as its own feature. A facility that stops reporting is often a
facility in trouble, and that is information, not absence of information.</p>

<h2>2. Timestamps mean different things in different columns</h2>

<p>In one dataset I worked with, <code>report_date</code> was when a form was
submitted, <code>period_end</code> was what it covered, and
<code>created_at</code> was when a clerk typed it in — sometimes months later.
Joining on the wrong one produces a pipeline that runs cleanly and is
systematically wrong.</p>

<pre><code class="language-sql">-- The join that looks fine and leaks the future
SELECT f.facility_id, f.stock_level, w.rainfall_mm
FROM facility_reports f
JOIN weather w ON w.observed_date = f.created_at;  -- data-entry date

-- What was meant
SELECT f.facility_id, f.stock_level, w.rainfall_mm
FROM facility_reports f
JOIN weather w ON w.observed_date = f.period_end;
</code></pre>

<h2>3. Categorical values drift without announcement</h2>

<p>"Nairobi", "NAIROBI", "Nairobi County" and "nrb" were four distinct values in a
county column, created by four different intake forms over six years. Nobody
changed a schema. The data just quietly stopped meaning one thing.</p>

<p>Assert on the set of distinct values, not just on types. A new category
appearing should fail the build, or at minimum page someone.</p>

<h2>4. The backfill that silently changed history</h2>

<p>Someone corrects two years of records. Your model was trained on the old
version, your evaluation runs on the new one, and the metrics improve for no
reason anyone can name.</p>

<p>Version your training snapshots. Store the hash of the data alongside the model,
and refuse to compare metrics across different hashes.</p>

<h2>Why this never gets prioritised</h2>

<p>None of it produces a demo. It produces the absence of a specific future
disaster, which is impossible to put in a quarterly update. The only argument I
have found that works is a concrete post-mortem of the last time one of these
cost real money.</p>
""",
    },
    {
        "title": "What I look for when reviewing a data portfolio",
        "category": "Career",
        "tags": ["mentoring", "portfolio", "hiring"],
        "featured": False,
        "excerpt": (
            "After a few hundred portfolio reviews, the thing that separates the "
            "memorable ones is not technique. It is whether the writer knows which "
            "decision was the hard one."
        ),
        "published_at": datetime(2024, 9, 5, 6, 0, tzinfo=timezone.utc),
        "content": """
<p>I have reviewed a lot of portfolios, mostly from people moving into their first
or second data role. The technically strong ones are common. The memorable ones
are not, and the difference is narrower than people expect.</p>

<h2>The Titanic problem</h2>

<p>A Titanic notebook tells me you can call <code>fit</code>. So does everyone
else's. The dataset is clean, the target is obvious, and every decision has been
made for you — which means there is nothing left in the project that is yours.</p>

<p>Use data where you had to decide something. Local data is good for this, not
because it is exotic but because the messiness is real and nobody has written the
tutorial.</p>

<h2>Show the decision, not the accuracy</h2>

<p>Most project write-ups are a linear account: loaded data, cleaned it, trained
three models, picked the best, 94% accuracy. That describes a procedure, and the
procedure is the part I already know.</p>

<p>What I want is the fork. Where were there two defensible options? Which did you
take? What did the other one cost?</p>

<blockquote>"I used a random split and got R² of 0.82. Blocking by season dropped
it to 0.61. The second number is the real one — the first was leaking through
spatial correlation between neighbouring plots."</blockquote>

<p>That sentence tells me more than any metric. It says you know what validation is
for.</p>

<h2>Negative results are worth more than they seem</h2>

<p>A project that says "I tried an LSTM, it matched gradient boosting and was
harder to explain, so I shipped the simpler model" is more convincing than a
project where everything worked. The first person has judgement. The second has a
notebook.</p>

<h2>Write it for a reader</h2>

<p>Code alone does not travel. A README that states the problem, the approach, the
result and the honest limitation — four paragraphs — does more for you than
another model in the ensemble.</p>

<p>The job involves persuading people who will not read your code. The portfolio is
the first evidence of whether you can.</p>
""",
    },
]


CERTIFICATIONS = [
    {
        "name": "TensorFlow Developer Certificate",
        "issuer": "Google",
        "issue_date": date(2023, 5, 1),
        "credential_id": "TF-DEV-2023-XXXX",
        "verification_url": "https://www.credential.net/",
        "description": "Neural network implementation, computer vision, NLP, and time series with TensorFlow.",
        "featured": True,
    },
    {
        "name": "AWS Certified Machine Learning — Specialty",
        "issuer": "Amazon Web Services",
        "issue_date": date(2023, 9, 1),
        "expiry_date": date(2026, 9, 1),
        "credential_id": "AWS-MLS-XXXX",
        "verification_url": "https://aws.amazon.com/verification",
        "description": "Designing, implementing and operating machine learning workloads on AWS.",
        "featured": True,
    },
    {
        "name": "Deep Learning Specialization",
        "issuer": "DeepLearning.AI",
        "issue_date": date(2022, 3, 1),
        "credential_id": "DLAI-XXXX",
        "verification_url": "https://www.coursera.org/account/accomplishments/",
        "description": "Five-course sequence covering neural networks, optimization, CNNs and sequence models.",
        "featured": True,
    },
    {
        "name": "Professional Data Engineer",
        "issuer": "Google Cloud",
        "issue_date": date(2024, 1, 1),
        "expiry_date": date(2026, 1, 1),
        "credential_id": "GCP-PDE-XXXX",
        "verification_url": "https://www.credential.net/",
        "description": "Designing data processing systems, operationalizing pipelines and ML models on GCP.",
        "featured": False,
    },
]


TESTIMONIALS = [
    {
        "name": "Amina Wanjiru",
        "title": "Head of Credit",
        "organization": "Sokoni Analytics",
        "content": (
            "Emmanuel rebuilt our risk model, but the part I valued most was that he "
            "insisted on making it explainable before making it accurate. Our loan "
            "officers can now tell an applicant exactly why a decision went the way it "
            "did. That changed how the whole team works, not just the numbers."
        ),
        "linkedin_url": "https://www.linkedin.com/in/",
    },
    {
        "name": "Dr. Peter Ochieng",
        "title": "Director of Health Informatics",
        "organization": "Mradi Health Data Lab",
        "content": (
            "He has an unusual willingness to say when a model is not ready. On the "
            "stockout project he pushed back on our timeline twice because the "
            "reporting lag was not handled properly. He was right both times, and the "
            "system has run without a major correction since."
        ),
        "linkedin_url": "https://www.linkedin.com/in/",
    },
    {
        "name": "Grace Mutindi",
        "title": "Data Scientist",
        "organization": "Formerly a mentee",
        "content": (
            "Emmanuel mentored me through my first production deployment. He never "
            "just gave me the answer — he would ask what I expected to happen and why, "
            "until I found the problem myself. I still use that habit when reviewing "
            "other people's work."
        ),
        "linkedin_url": "https://www.linkedin.com/in/",
    },
]


def seed(force: bool = False) -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        if force:
            # Association rows first. These are bulk deletes, which do not run
            # ORM cascades, so the link table has to be cleared by hand — and
            # SQLite reuses ids after a delete, so leftovers collide on reseed.
            db.execute(delete(blog_post_tags))
            db.execute(delete(ProjectMedia.__table__))
            db.execute(delete(ExperienceAchievement.__table__))
            db.execute(delete(ProfileStat.__table__))
            db.execute(delete(ExpertiseArea.__table__))

            # Then the owning tables, dependents before their parents.
            for model in (
                BlogPost, BlogTag, BlogCategory, Project, Certification,
                Testimonial, Skill, SkillCategory, Experience, Education,
                Profile, SiteSettings, SocialLink,
            ):
                db.query(model).delete()
            db.commit()
            print("Cleared existing content.")

        if db.scalar(select(Profile).limit(1)) is not None:
            print("Content already present. Use --force to wipe and reseed.")
            return

        # --- admin user -----------------------------------------------------
        admin = db.scalar(select(User).where(User.email == settings.ADMIN_EMAIL.lower()))
        if admin is None:
            admin = User(
                name=settings.ADMIN_NAME,
                email=settings.ADMIN_EMAIL.lower(),
                hashed_password=hash_password(settings.ADMIN_PASSWORD),
                role="admin",
            )
            db.add(admin)
            db.flush()
            print(f"Created admin user: {admin.email}")

        # --- profile --------------------------------------------------------
        profile = Profile(
            id=1,
            name="Emmanuel Kiriinya",
            headline="Data Scientist · Machine Learning · AI",
            hero_description=(
                "I build models that hold up outside the notebook — credit risk, "
                "yield forecasting, and language systems for African data. Most of my "
                "work lives somewhere between a research question and a production "
                "deployment."
            ),
            about_heading="Models that survive contact with the real world",
            bio=(
                "I am a data scientist working across agriculture, lending and health "
                "in East Africa. My work usually starts with a question somebody in "
                "operations is already asking and ends with something running on a "
                "schedule, monitored, with a person who knows what to do when it "
                "drifts.\n\n"
                "That sequence is the part I care about. A model that reaches 0.9 AUC "
                "in a notebook and never ships has produced nothing. Most of my time "
                "goes into the unglamorous middle: defining the target properly, "
                "finding the leak, deciding what the prediction interval means for "
                "someone who has to price a loan.\n\n"
                "I also mentor early-career data professionals, which keeps me honest. "
                "Explaining why a validation split is wrong to someone encountering it "
                "for the first time is the fastest way to find out whether you actually "
                "understand it."
            ),
            location="Nairobi, Kenya",
            primary_cta_label="View projects",
            primary_cta_url="/projects",
            secondary_cta_label="View resume",
            secondary_cta_url="/resume",
        )
        profile.stats = [
            ProfileStat(label="Years in data", value="6+", display_order=0),
            ProfileStat(label="Models in production", value="12", display_order=1),
            ProfileStat(label="People mentored", value="40+", display_order=2),
            ProfileStat(label="Articles written", value="5", display_order=3),
        ]
        profile.expertise = [
            ExpertiseArea(
                title="Applied machine learning",
                description="Risk scoring, forecasting and classification where the "
                "deployment constraints shape the model, not the other way around.",
                display_order=0,
            ),
            ExpertiseArea(
                title="Geospatial and time series",
                description="Satellite-derived features, phenology-aware aggregation, "
                "and validation that respects spatial and temporal structure.",
                display_order=1,
            ),
            ExpertiseArea(
                title="NLP for African languages",
                description="Code-switched text, low-resource fine-tuning, and the "
                "annotation work that decides whether any of it is possible.",
                display_order=2,
            ),
            ExpertiseArea(
                title="Explainability in practice",
                description="Making a model's reasoning usable by the person who has "
                "to defend the decision to a customer or a regulator.",
                display_order=3,
            ),
        ]
        db.add(profile)

        # --- site settings --------------------------------------------------
        db.add(
            SiteSettings(
                id=1,
                site_title="Emmanuel Kiriinya — Data Scientist",
                site_description=(
                    "Data scientist working on credit risk, yield forecasting and "
                    "African-language NLP. Projects, technical writing, and a resume."
                ),
                site_url="https://emmanuelkiriinya.com",
                default_keywords=(
                    "data scientist, machine learning, artificial intelligence, "
                    "Kenya, Nairobi, NLP, forecasting, credit risk"
                ),
                resume_url="https://drive.google.com/file/d/REPLACE_WITH_YOUR_FILE_ID/view",
                resume_type="drive",
                resume_label="Download resume",
                public_email="hello@emmanuelkiriinya.com",
                contact_heading="Let's talk",
                contact_intro=(
                    "I'm open to consulting work, research collaboration, and "
                    "conversations about data problems in agriculture, lending and "
                    "health. I reply to everything that isn't a recruiter template."
                ),
                theme_default="dark",
            )
        )

        # --- social links ---------------------------------------------------
        # LinkedIn is no longer in Simple Icons (trademark takedown), so it
        # comes from Iconify instead.
        for order, (platform, label, url, icon_url) in enumerate(
            [
                ("linkedin", "LinkedIn", "https://www.linkedin.com/in/", logos("linkedin-icon")),
                ("github", "GitHub", "https://github.com/", simple("github")),
                ("email", "Email", "mailto:hello@emmanuelkiriinya.com", simple("maildotru")),
            ]
        ):
            db.add(
                SocialLink(
                    platform=platform,
                    label=label,
                    url=url,
                    icon_url=icon_url,
                    display_order=order,
                )
            )

        # --- skills ---------------------------------------------------------
        for cat_order, (cat_name, entries) in enumerate(SKILL_TREE.items()):
            category = SkillCategory(
                name=cat_name, slug=slugify(cat_name), display_order=cat_order
            )
            db.add(category)
            db.flush()
            for skill_order, (name, icon_url, official) in enumerate(entries):
                db.add(
                    Skill(
                        name=name,
                        icon_url=icon_url,
                        category_id=category.id,
                        official_url=official or None,
                        display_order=skill_order,
                    )
                )

        # --- experience -----------------------------------------------------
        for order, entry in enumerate(EXPERIENCE):
            achievements = entry.pop("achievements", [])
            exp = Experience(**entry, display_order=order)
            exp.achievements = [
                ExperienceAchievement(content=text, display_order=i)
                for i, text in enumerate(achievements)
            ]
            db.add(exp)

        # --- education ------------------------------------------------------
        for order, entry in enumerate(EDUCATION):
            db.add(Education(**entry, display_order=order))

        # --- projects -------------------------------------------------------
        for order, entry in enumerate(PROJECTS):
            data = dict(entry)
            data["slug"] = slugify(data["title"])
            data["status"] = "published"
            data["live_url"] = data.get("live_url") or None
            db.add(Project(**data, display_order=order))

        # --- blog -----------------------------------------------------------
        categories: dict[str, BlogCategory] = {}
        for order, (name, description, accent) in enumerate(BLOG_CATEGORIES):
            category = BlogCategory(
                name=name,
                slug=slugify(name),
                description=description,
                accent=accent,
                display_order=order,
            )
            db.add(category)
            db.flush()
            categories[name] = category

        tags: dict[str, BlogTag] = {}
        for entry in BLOG_POSTS:
            for tag_name in entry["tags"]:
                if tag_name not in tags:
                    tag = BlogTag(name=tag_name, slug=slugify(tag_name))
                    db.add(tag)
                    db.flush()
                    tags[tag_name] = tag

        for entry in BLOG_POSTS:
            content = entry["content"].strip()
            post = BlogPost(
                title=entry["title"],
                slug=slugify(entry["title"]),
                excerpt=entry["excerpt"],
                content=content,
                category_id=categories[entry["category"]].id,
                author_id=admin.id,
                status="published",
                featured=entry["featured"],
                reading_minutes=reading_minutes(content),
                published_at=entry["published_at"],
            )
            post.tags = [tags[name] for name in entry["tags"]]
            db.add(post)

        # --- certifications & testimonials ----------------------------------
        for order, entry in enumerate(CERTIFICATIONS):
            db.add(Certification(**entry, display_order=order))

        for order, entry in enumerate(TESTIMONIALS):
            db.add(Testimonial(**entry, display_order=order))

        db.commit()
        print("Seeded profile, skills, experience, education, projects, blog, "
              "certifications and testimonials.")
        print(f"\nSign in at /admin with {settings.ADMIN_EMAIL}")
        print("Change that password immediately after the first sign-in.")

    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed(force="--force" in sys.argv)
