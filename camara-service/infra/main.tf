terraform {
  backend "gcs" {
    bucket = "catoverheater-tf-state"
    prefix = "terraform/state"
  }
}

locals {
  project_name = "catoverheater"
  project_id = "1041191131324"
  region = "europe-central2"
  service_name = "camara-service"
  repo = "europe-central2-docker.pkg.dev/steady-atlas-437416-k4/cloud-run-repo"
}


provider "google" {
  project = local.project_id
  region  = local.region
}

resource "null_resource" "docker_build_push" {
  provisioner "local-exec" {
    command = <<EOT
      cd ../ && gcloud builds submit --tag ${local.repo}/${local.service_name}
    EOT
  }
}

resource "google_cloud_run_v2_service" "camara_service" {
  name                = local.service_name
  location            = local.region
  deletion_protection = false
  ingress             = "INGRESS_TRAFFIC_ALL"

  template {
    containers {
      image = "${local.repo}/${local.service_name}"
    }
  }
  depends_on = [ null_resource.docker_build_push ]
}
