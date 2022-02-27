import {Hook} from '@oclif/core'

const hook: Hook<'init'> = async function () {
  /* prettier-ignore */
  process.stdout.write('\u001B[33m  ____  _________   \u001B[35m   _______   ____\n')
  /* prettier-ignore */
  process.stdout.write('\u001B[33m / __ \\/_  __/ _ | \u001B[35m   / ___/ /  /  _/\n')
  /* prettier-ignore */
  process.stdout.write('\u001B[33m/ /_/ / / / / __ |  \u001B[35m / /__/ /___/ /  \n')
  /* prettier-ignore */
  process.stdout.write('\u001B[33m\\____/ /_/ /_/ |_| \u001B[35m  \\___/____/___/  \n')

  process.stdout.write('\u001B[0m\n')
}

export default hook
