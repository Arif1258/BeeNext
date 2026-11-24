def make_prob(description, input_format, output_format, constraints, examples):
    return {
        "description": description.strip(),
        "inputFormat": input_format.strip(),
        "outputFormat": output_format.strip(),
        "constraints": constraints.strip(),
        "examples": examples,
    }
