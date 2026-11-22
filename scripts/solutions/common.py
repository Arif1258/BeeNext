def make_sol(bf_code: str, bf_tc: str, bf_sc: str, opt_code: str, opt_tc: str, opt_sc: str):
    return {
        "bf_code": bf_code.strip(),
        "bf_tc": bf_tc.strip(),
        "bf_sc": bf_sc.strip(),
        "opt_code": opt_code.strip(),
        "opt_tc": opt_tc.strip(),
        "opt_sc": opt_sc.strip(),
    }
