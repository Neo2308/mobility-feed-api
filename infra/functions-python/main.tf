#
# MobilityData 2023
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

locals {
  functions_dir          = "${path.module}../../../functions-python"
  function_config_file   = "function_config.json"
  function_tokens_path   = "${path.module}../../../functions-python/tokens"
  function_tokens_config = jsondecode(file("${path.module}../../../functions-python/tokens/function_config.json"))
  function_tokens_zip    = "${path.module}/../../functions-python/tokens/.dist/tokens.zip"
}

# Service account to execute the cloud functions
resource "google_service_account" "functions_service_account" {
  account_id   = "functions-service-account"
  display_name = "Functions Service Account"
}

resource "google_storage_bucket" "functions_bucket" {
  name     = "mobility-feeds-functions-python-${var.environment}"
  location = "us"
}

resource "google_storage_bucket_object" "function_token_zip" {
  name   = "tokens-${substr(filebase64sha256(local.function_tokens_zip),0,10)}.zip"
  bucket = google_storage_bucket.functions_bucket.name
  source = local.function_tokens_zip
}

data "google_iam_policy" "secret_access" {
  binding {
    role = "roles/secretmanager.secretAccessor"
    members = [
      "serviceAccount:${google_service_account.functions_service_account.email}"
    ]
  }
}

resource "google_secret_manager_secret_iam_policy" "policy" {
  for_each = { for x in local.function_tokens_config.secret_environment_variables: x.key => x }

  project = var.project_id
  secret_id = "${upper(var.environment)}_${each.key}"
  policy_data = data.google_iam_policy.secret_access.policy_data
}

resource "google_cloudfunctions2_function" "tokens" {
  name        = local.function_tokens_config.name
  description = local.function_tokens_config.description
  location    = var.gcp_region
  build_config {
    runtime     = var.python_runtime
    entry_point = local.function_tokens_config.entry_point
    source {
      storage_source {
        bucket = google_storage_bucket.functions_bucket.name
        object = google_storage_bucket_object.function_token_zip.name
      }
    }
  }
  service_config {
    available_memory = local.function_tokens_config.memory
    timeout_seconds = local.function_tokens_config.timeout
    available_cpu = local.function_tokens_config.available_cpu
    max_instance_request_concurrency = local.function_tokens_config.max_instance_request_concurrency
    max_instance_count = local.function_tokens_config.max_instance_count
    min_instance_count = local.function_tokens_config.min_instance_count
    dynamic "secret_environment_variables" {
      for_each = local.function_tokens_config.secret_environment_variables
      content {
        key        = secret_environment_variables.value["key"]
        project_id = var.project_id
        secret     = "${upper(var.environment)}_${secret_environment_variables.value["key"]}"
        version    = "latest"
      }
    }
    service_account_email = google_service_account.functions_service_account.email
    ingress_settings = local.function_tokens_config.ingress_settings
  }
}

# IAM entry for all users to invoke the function 
resource "google_cloudfunctions2_function_iam_member" "tokens_invoker" {
  project        = var.project_id
  location         = var.gcp_region
  cloud_function = google_cloudfunctions2_function.tokens.name
  role           = "roles/cloudfunctions.invoker"
  member         = "allUsers"
}

resource "google_cloud_run_service_iam_member" "tokens_cloud_run_invoker" {
  project        = var.project_id
  location         = var.gcp_region
  service = google_cloudfunctions2_function.tokens.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

output "function_tokens_name" {
  value = google_cloudfunctions2_function.tokens.name
}