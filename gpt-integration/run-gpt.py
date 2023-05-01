import os
from langchain.llms import OpenAI
from langchain.agents import create_csv_agent
import sys


# OPENAI_API_KEY must be set

current_dir = os.path.dirname(os.path.abspath(__file__))

dbPath = os.path.join(current_dir, "../db", "sample_data.csv")

agent = create_csv_agent(OpenAI(temperature=0),
                        dbPath,
                        verbose=True)

prompt = "Act as a friendly and informative medical professional and answer the following question: "
# Get the first argument passed to the script
# Example: "What is the first name, last name, height, and weight of patient 4d53df?"
promptAddition = sys.argv[1]

prompt += promptAddition

prompt += "\n When speaking about patients, use their first and last name, not their patient id."

output = agent.run(prompt)

