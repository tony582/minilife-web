import re

with open('src/components/common/GlobalModals.jsx', 'r') as f:
    content = f.read()
    
# Extract context destructured variables
start_idx = content.find('const {') + 7
end_idx = content.find('} = context;')
context_vars_str = content[start_idx:end_idx]

context_vars = [v.strip() for v in context_vars_str.replace('\n', ',').split(',') if v.strip()]

# Now parse src/App.jsx to see what we are missing
with open('src/App.jsx', 'r') as f:
    app_content = f.read()
    
missing = []
for var in context_vars:
    # Only care about the getter
    if var.startswith('set') or 'handle' in var or var == 'notify' or var == 'generateCodes' or var == 'getTaskStatusOnDate' or var == 'getTaskTimeSpent' or var == 'getIncompleteStudyTasksCount' or var == 'buyItem' or var == 'confirmSubmitTask' or var == 'confirmTransfer' or var == 'updateActiveKid' or var == 'updateKidData':
        continue
    
    # Check if the variable is defined natively
    if f"const [{var}" not in app_content and f"const {var} " not in app_content and f"const {{{var}}}" not in app_content and f"function {var}" not in app_content and f"const {var} =" not in app_content:
        missing.append(var)

print("MISSING VARS:", missing)

with open('tmp_all_old_consts.txt', 'r') as f:
    old_lines = f.readlines()

print("\n--- CODE TO ADD ---")
for line in old_lines:
    for var in missing:
        if f"const [{var}" in line:
            print(line.strip())
