import json
import sys

sys.path.insert(0, '/Users/skarifahmed/Documents/Files/codes/beenext/scripts')

from solutions.beginner import BEGINNER_SOLUTIONS
from solutions.arrays import ARRAYS_SOLUTIONS
from solutions.hashing import HASHING_SOLUTIONS
from solutions.maths import MATHS_SOLUTIONS
from solutions.binary_search import BINARY_SEARCH_SOLUTIONS
from solutions.strings import STRINGS_SOLUTIONS
from solutions.bit_manipulation import BIT_SOLUTIONS
from solutions.greedy import GREEDY_SOLUTIONS
from solutions.sliding_window import SLIDING_WINDOW_SOLUTIONS
from solutions.recursion import RECURSION_SOLUTIONS
from solutions.stack_queues import STACK_QUEUES_SOLUTIONS
from solutions.binary_trees import BINARY_TREES_SOLUTIONS
from solutions.heaps import HEAPS_SOLUTIONS
from solutions.graphs import GRAPHS_SOLUTIONS
from solutions.dp import DP_SOLUTIONS
from solutions.tries import TRIES_SOLUTIONS

with open('/tmp/full_sheet_parsed.json') as f:
    cats = json.load(f)

modules_map = {
    'beginner-problem': BEGINNER_SOLUTIONS,
    'arrays': ARRAYS_SOLUTIONS,
    'hashing': HASHING_SOLUTIONS,
    'binary-search': BINARY_SEARCH_SOLUTIONS,
    'strings-basic-and-medium': STRINGS_SOLUTIONS,
    'recursion': RECURSION_SOLUTIONS,
    'linked-list': None, # will load below
    'bit-manipulation': BIT_SOLUTIONS,
    'greedy-algorithms': GREEDY_SOLUTIONS,
    'sliding-window-and-2-pointer': SLIDING_WINDOW_SOLUTIONS,
    'stack-and-queues': STACK_QUEUES_SOLUTIONS,
    'binary-trees': BINARY_TREES_SOLUTIONS,
    'binary-search-trees': BINARY_TREES_SOLUTIONS,
    'heaps': HEAPS_SOLUTIONS,
    'graph': GRAPHS_SOLUTIONS,
    'dynamic-programming': DP_SOLUTIONS,
    'tries': TRIES_SOLUTIONS,
    'strings--advanced-algo': STRINGS_SOLUTIONS,
    'maths': MATHS_SOLUTIONS,
}

from solutions.linked_list import LINKED_LIST_SOLUTIONS
modules_map['linked-list'] = LINKED_LIST_SOLUTIONS

slug_to_db_slug = {
    'beginner-problem': 'beginner-problems',
    'sorting': 'sorting',
    'arrays': 'arrays',
    'hashing': 'hashing',
    'binary-search': 'binary-search',
    'strings-basic-and-medium': 'strings-basic-and-medium',
    'recursion': 'recursion',
    'linked-list': 'linked-list',
    'bit-manipulation': 'bit-manipulation',
    'greedy-algorithms': 'greedy-algorithms',
    'sliding-window-and-2-pointer': 'sliding-window-2-pointer',
    'stack-and-queues': 'stack-queues',
    'binary-trees': 'binary-trees',
    'binary-search-trees': 'binary-search-trees',
    'heaps': 'heaps',
    'graph': 'graphs',
    'dynamic-programming': 'dynamic-programming',
    'tries': 'tries',
    'strings--advanced-algo': 'strings-advanced-algo',
    'maths': 'maths',
}

def map_diff(p, cat_slug):
    raw = p.get('difficulty')
    if raw == 'basic':
        return 'EASY'
    elif raw == 'core':
        return 'MEDIUM'
    elif raw == 'pro':
        return 'HARD'
    
    if cat_slug == 'beginner-problem':
        return 'EASY'
    return 'MEDIUM'

export_data = []
total_count = 0

for cat in cats:
    cat_slug = cat['slug']
    if cat_slug == 'sorting':
        print(f"Skipping sorting (protected, already completed)")
        continue
    
    db_cat_slug = slug_to_db_slug[cat_slug]
    sol_dict = modules_map[cat_slug]
    
    cat_entry = {
        'sheet_cat_slug': cat_slug,
        'db_cat_slug': db_cat_slug,
        'label': cat['label'],
        'problems': []
    }
    
    for idx, p in enumerate(cat['problems']):
        orig_slug = p['slug']
        
        # Handle slug collision
        if cat_slug == 'beginner-problem' and orig_slug == 'basic-hashing':
            db_slug = 'beginner-basic-hashing'
            lookup_slug = 'beginner-basic-hashing'
        else:
            db_slug = orig_slug
            lookup_slug = orig_slug
            
        sol = sol_dict.get(lookup_slug) or sol_dict.get(orig_slug)
        if not sol:
            raise ValueError(f"Solution missing for {cat_slug} -> {orig_slug}")
            
        yt = p.get('yt_video')
        if yt and not yt.strip():
            yt = None
            
        lc = p.get('leetcode_link')
        if lc and not lc.strip():
            lc = None
            
        cat_entry['problems'].append({
            'order': idx + 1,
            'title': p['label'],
            'slug': db_slug,
            'difficulty': map_diff(p, cat_slug),
            'youtubeUrl': yt,
            'leetcodeUrl': lc,
            'subtopic': p.get('subtopic', ''),
            'solutions': sol
        })
        total_count += 1
        
    export_data.append(cat_entry)
    print(f"Prepared {len(cat_entry['problems'])} problems for {db_cat_slug}")

out_path = '/tmp/all_remaining_problems_to_seed.json'
with open(out_path, 'w') as f:
    json.dump(export_data, f, indent=2)

print(f"\nSuccessfully prepared {total_count} problems across {len(export_data)} categories in {out_path}")
