import { EOL } from 'os'
import execa from 'execa'

const { parse, stringify } = JSON
const { has } = Reflect

export default class JavaRunner {
  constructor(funOptions, env) {
    const {
      functionName,
      handler,
      servicePackage,
      functionPackage,
    } = funOptions

    this._env = env
    this._functionName = functionName
    this._handler = handler
    this._deployPackage = functionPackage || servicePackage
  }

  // no-op
  // () => void
  cleanup() {}

  _parsePayload(value) {
    for (const item of value.split(EOL)) {
      let json

      // first check if it's JSON
      try {
        json = parse(item)
        // nope, it's not JSON
      } catch (err) {
        // no-op
      }

      // now let's see if we have a property __offline_payload__
      if (
        json &&
        typeof json === 'object' &&
        has(json, '__offline_payload__')
      ) {
        return json.__offline_payload__
      }
    }

    return undefined
  }

  async run(event, context) {
    const input = stringify({
      context,
      event,
    })

    const args = [
      '-c',
      this._handler,
      '-a',
      this._deployPackage,
      '-f',
      this._functionName,
      '-d',
      input,
      '--json-output',
      '--serverless-offline',
    ]

    const java = execa('lambda-local', args, {
      env: this._env,
      input,
      // shell: true,
    })

    let result

    try {
      result = await java
    } catch (err) {
      // TODO
      console.log(err)

      throw err
    }

    const { stderr, stdout } = result

    if (stderr) {
      // TODO
      console.log(stderr)

      return stderr
    }

    try {
      return this._parsePayload(stdout)
    } catch (err) {
      console.log(stdout)
      // TODO return or re-throw?
      return err
    }
  }
}
