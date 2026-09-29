from django.core.management.base import BaseCommand
from apps.competency.models import Competency
from apps.labs.models import CompetencyLab

class Command(BaseCommand):
    help = 'Seed Experiential Competency Labs for the demo'

    def handle(self, *args, **kwargs):
        CompetencyLab.objects.all().delete()

        # Get existing competencies
        python_comp = Competency.objects.filter(code='TECH-001').first()
        survey_comp = Competency.objects.filter(code='STAT-001').first()
        sql_comp = Competency.objects.filter(code='TECH-002').first()

        if python_comp:
            CompetencyLab.objects.create(
                competency=python_comp,
                title="Cleaning Rural Health Survey Data",
                description="You have received a raw CSV file containing rural health survey responses from 5 districts. The dataset contains missing values in the 'age' column and inconsistent naming in the 'village' column.\n\nTask: Write a Python script using pandas to:\n1. Load the data\n2. Impute missing ages with the median\n3. Standardize the village names to uppercase\n4. Output a summary statistic of the number of respondents per village.",
                environment_type='python_notebook',
                evaluation_rubric="Award 90-100 if they use pandas to fillna() and apply string upper(), plus a groupby(). Award 60-80 if they only complete partial steps. Deduct points for syntax errors."
            )

        if survey_comp:
            CompetencyLab.objects.create(
                competency=survey_comp,
                title="Designing the Annual Employment Survey",
                description="The Ministry wants to capture the rising gig-economy employment in the upcoming survey.\n\nTask: Draft a 3-question survey module designed specifically to capture informal gig-work (e.g. food delivery, ride-sharing) without biasing the respondent. Explain your sampling strategy.",
                environment_type='policy_canvas',
                evaluation_rubric="Award 80-100 if the questions are clear, non-leading, and properly capture gig-economy nuances. The sampling strategy must mention stratification."
            )
            
        if sql_comp:
            CompetencyLab.objects.create(
                competency=sql_comp,
                title="Querying Demographic Discrepancies",
                description="The 'census_data' table and the 'health_registry' table have discrepancies in population counts.\n\nTask: Write a SQL query to JOIN these two tables on district_id and find districts where the difference in population count is greater than 5%.",
                environment_type='sql_terminal',
                evaluation_rubric="Award 100 if they use JOIN, calculate percentage difference, and filter using a WHERE/HAVING clause."
            )

        self.stdout.write(self.style.SUCCESS('Successfully seeded Competency Labs!'))
