import json
import argparse

parser = argparse.ArgumentParser(
    description="Validate chain configs"
)
parser.add_argument(
    "--network",
    dest="network",
    choices=["testnet", "mainnet"],
    help="select network",
)

args = parser.parse_args()
environment = args.network

f = open(f'{environment}/inputs.json')
chains = json.load(f)

for chain in chains:
    ##todo: validate inputs here