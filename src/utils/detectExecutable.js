import execa from 'execa'

async function detectExecutable(exe, versionFlag = '--version') {
  try {
    const { failed } = await execa(exe, [versionFlag])

    return failed === false
  } catch (e) {
    return false
  }
}

export async function detectPython2() {
  return detectExecutable('python2')
}

export async function detectPython3() {
  return detectExecutable('python3')
}

export async function detectRuby() {
  return detectExecutable('ruby')
}

export async function detectJava() {
  return detectExecutable('java', '-version')
}
