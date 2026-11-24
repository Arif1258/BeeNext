import json
import os
import sys
from pathlib import Path

# Add scripts directory to sys.path
scripts_dir = Path(__file__).resolve().parent.parent
sys.path.append(str(scripts_dir))

from problem_data.beginner import BEGINNER_DATA
from problem_data.sorting import SORTING_PROBLEMS
from problem_data.arrays_hashing import ARRAYS_HASHING_DATA
from problem_data.binary_search import BINARY_SEARCH_DATA
from problem_data.strings import STRINGS_DATA
from problem_data.recursion import RECURSION_DATA
from problem_data.linked_list import LINKED_LIST_DATA
from problem_data.bit_greedy import BIT_GREEDY_DATA
from problem_data.sliding_window import SLIDING_WINDOW_DATA
from problem_data.stack_queues import STACK_QUEUES_DATA
from problem_data.trees_bst import TREES_BST_DATA
from problem_data.heaps_tries_maths import HEAPS_TRIES_MATHS_DATA
from problem_data.graphs import GRAPHS_DATA
from problem_data.dp import DP_DATA

MODULE_DICTS = [
    ("beginner", BEGINNER_DATA),
    ("sorting", SORTING_PROBLEMS),
    ("arrays_hashing", ARRAYS_HASHING_DATA),
    ("binary_search", BINARY_SEARCH_DATA),
    ("strings", STRINGS_DATA),
    ("recursion", RECURSION_DATA),
    ("linked_list", LINKED_LIST_DATA),
    ("bit_greedy", BIT_GREEDY_DATA),
    ("sliding_window", SLIDING_WINDOW_DATA),
    ("stack_queues", STACK_QUEUES_DATA),
    ("trees_bst", TREES_BST_DATA),
    ("heaps_tries_maths", HEAPS_TRIES_MATHS_DATA),
    ("graphs", GRAPHS_DATA),
    ("dp", DP_DATA),
]

def main():
    combined = {}
    for name, d in MODULE_DICTS:
        print(f"Module {name}: {len(d)} problems")
        for slug, data in d.items():
            if slug in combined:
                print(f"WARNING: duplicate slug '{slug}' in {name}!")
            combined[slug] = data

    print(f"\nTotal unique problems gathered: {len(combined)}")

    # Check against all_slugs_dump.txt if present
    dump_file = scripts_dir / "all_slugs_dump.txt"
    if dump_file.exists():
        with open(dump_file, "r") as f:
            db_slugs = [line.strip() for line in f if line.strip()]
        print(f"Total slugs in all_slugs_dump.txt: {len(db_slugs)}")

        missing_in_combined = set(db_slugs) - set(combined.keys())
        extra_in_combined = set(combined.keys()) - set(db_slugs)

        if missing_in_combined:
            print(f"ERROR: Missing {len(missing_in_combined)} slugs from DB dump:")
            for s in sorted(missing_in_combined):
                print(f"  - {s}")
        else:
            print("SUCCESS: 100% of DB slugs are present in combined dataset!")

        if extra_in_combined:
            print(f"WARNING: {len(extra_in_combined)} extra slugs not in DB dump:")
            for s in sorted(extra_in_combined):
                print(f"  + {s}")

    out_file = scripts_dir / "all_problem_statements.json"
    with open(out_file, "w") as f:
        json.dump(combined, f, indent=2)

    print(f"Saved complete dataset to {out_file} ({out_file.stat().st_size} bytes)")

if __name__ == "__main__":
    main()
