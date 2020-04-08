import { expect } from 'chai'
import { download } from '../src/tasks/submission'
import * as fs from 'fs'
import { mkdir, rm } from 'shelljs'
import config = require('../config.js')
import * as path from 'path'
import SubmissionScenario from '../src/tasks/submission'
import { SubmissionJob } from '../src/types/job'

describe('Submission Scenario', () => {
  it('should download', async () => {
    const url = 'https://minio.cb.lk/public/input'
    const result = await download(url, '/tmp/input')

    // assertion
    const content = fs.readFileSync('/tmp/input').toString()
    expect(content.trim()).to.eq('World')
  })

  it('should setup', async () => {
    const source = 'print("Hello World")'

    const job: SubmissionJob = {
      id: 1,
      source: (new Buffer(source)).toString('base64'),
      lang: 'py3',
      timelimit: 5,
      testcases: [{ 
        id: 122, 
        input: 'https://minio.cb.lk/public/input', 
        output: 'https://minio.cb.lk/public/output' 
      }]
    }

    rm('-rf', config.RUNBOX.DIR)
    mkdir('-p', config.RUNBOX.DIR)
    const currentJobDir = path.join(config.RUNBOX.DIR, job.id.toString())
    mkdir('-p', currentJobDir)

    await SubmissionScenario.setup(currentJobDir, job)

    //assertions
    const stdin = fs.readFileSync(path.join(currentJobDir, 'testcases', '' + job.testcases[0].id, 'stdin')).toString()
    expect(stdin.trim()).to.eq('World')

    const stdout = fs.readFileSync(path.join(currentJobDir, 'testcases', '' + job.testcases[0].id, 'stdout')).toString()
    expect(stdout.trim()).to.eq('Hello World')

  })
})
