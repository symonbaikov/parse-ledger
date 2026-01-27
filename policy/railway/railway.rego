package main

deny[msg] {
  not input.deploy
  msg := "railway: deploy section is required"
}

deny[msg] {
  input.deploy
  start := object.get(input.deploy, "startCommand", "")
  start == ""
  msg := "railway: deploy.startCommand must be set"
}

deny[msg] {
  input.deploy
  policy := object.get(input.deploy, "restartPolicyType", "")
  policy == ""
  msg := "railway: deploy.restartPolicyType must be set"
}

deny[msg] {
  input.deploy
  policy := object.get(input.deploy, "restartPolicyType", "")
  policy != "never"
  retries := object.get(input.deploy, "restartPolicyMaxRetries", 0)
  retries <= 0
  msg := "railway: deploy.restartPolicyMaxRetries must be > 0 unless restartPolicyType == \"never\""
}
