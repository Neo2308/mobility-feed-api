# Python Functions

This folder contains Python functions. These functions should not have interdependencies. However, common code can be shared across multiple functions if they are in folders that don't contain functions.

# Python function folders
On each function folder, a file should contain all related configurations. Currently, there is no automated process to deploy all functions; this is why, to be able to deploy it the function should be added to the terraform scripts. In the future, we should automate the deployment.

# Function folder structure
Each function folder should contain the following files:
- `main.py`: The main file that contains the function code.
- `function_config.json`: The configuration of the function. This file is used to configure the cloud function on the terraform file.
- `requirements.txt`: The dependencies of the function.
- `requirements_dev.txt`: The dependencies of the function for local development.
- `tests`: The folder that contains the unit tests of the function.

# Function configuration(function_config.json)
The function configuration file contains the following properties:
- `name`: The name of the function.
- `description`: The description of the function.
- `entry_point`: The name of the function to be executed.
- `runtime`: The runtime of the function. Currently, only `python37` is supported.
- `timeout`: The timeout of the function in seconds. The default value is 60 seconds.
- `memory`: The memory of the function in MB. The default value is 128 MB.
- `trigger_http`: A boolean value that indicates if the function is triggered by an HTTP request. The default value is `false`.
- `include_folders`: A list of folders to be included in the function zip. By default, the function zip will include all the files in the function folder.
- `secret_environment_variables`: A list of environment variables that should be stored as secrets.
- `ingress_settings`: The ingress settings of the function.
- `max_instance_request_concurrency`: The maximum number of concurrent requests allowed for a function instance.
- `max_instance_count`: The maximum number of function instances that can be created in response to a load.
- `min_instance_count`: The minimum number of function instances that can be created in response to a load.
- `available_cpu_count`: The number of CPU cores that are available to the function.


# Useful scripts
- To locally execute a function use the following command:
```
./scripts/function-python-run.sh --function_name tokens
```
- To locally create a distribution zip use the following command:
```
./scripts/function-python-build.sh --function_name tokens
```
or 
```
./scripts/function-python-build.sh --all
```
- Start local and test database
```
docker-compose --env-file ./config/.env.local up -d liquibase-test
```

# Local variables
To be able to set environment variables, add a file `.env.local` file to a function's folder and provide the name-value pair as follows:
```
export MY_AWESOME_KEY=MY_AWESOME_VALUE
```

# Unit tests
If a folder `tests` is added to a function's folder, the script `api-test.sh` will execute the tests without any further configuration.
Make sure the testing database is running before executing the tests.
```
docker-compose --env-file ./config/.env.local up -d liquibase-test
```
Execute all tests within the functions-python folder
```
./scripts/api-test.sh --folder functions-python 
```
Execute test from a specific function
```
./scripts/api-test.sh --folder functions-python/batch_datasets
```