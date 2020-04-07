import * as core from '@actions/core'
import * as exec from '@actions/exec'
import shell from 'shelljs'

const VAULT_VERSION = core.getInput('vault-version', { required: true })
const URL = core.getInput('url', { required: true })
const GITHUB_TOKEN = core.getInput('github-token', { required: true })
const SECRET_PATH = core.getInput('secret-path', { required: true })
const SECRET_FIELD = core.getInput('secret-field', { required: true })
const OUTPUT_DIR = core.getInput('output-dir', { required: true })
const OUTPUT_FILE = core.getInput('output-file', { required: true })
const RUN_ID = `${process.env['GITHUB_RUN_ID']}-${process.env['GITHUB_RUN_NUMBER']}`
const WORKSAPCE = process.env['GITHUB_WORKSPACE']

async function main () {
  let home = `${WORKSAPCE}/${RUN_ID}`
  await exec.exec(`mkdir -p ${home}`)

  await exec.exec(`wget https://releases.hashicorp.com/vault/${VAULT_VERSION}/vault_${VAULT_VERSION}_linux_amd64.zip -O ${home}/vault_${VAULT_VERSION}_linux_amd64.zip`)
  await exec.exec(`unzip -o ${home}/vault_${VAULT_VERSION}_linux_amd64.zip -d ${home}/`)
  core.addPath(`${home}`)

  process.env['VAULT_ADDR'] = URL

  await exec.exec(`vault login -no-print -method=github token=${GITHUB_TOKEN}`)
  await exec.exec(`mkdir -p ${OUTPUT_DIR}`)

  let output = `${OUTPUT_DIR}/${OUTPUT_FILE}`
  if (shell.exec(`vault read -field ${SECRET_FIELD} ${SECRET_PATH} > ${output}`).code !== 0) {
    shell.echo('Error: failed to reqd secret')
    shell.exit(1)
  }
}

main()
