# ota-cli

[![Version](https://img.shields.io/npm/v/ota-cli.svg)](https://npmjs.org/package/ota-cli)
[![License](https://img.shields.io/npm/l/ota-cli.svg)](https://github.com/d-corler/ota-cli/blob/main/package.json)

Uploads firmware over the air to devices like Arduino, ESP8266, ESP32, etc.

Authentication supported.

<!-- toc -->

- [Usage](#usage)
- [Commands](#commands)
<!-- tocstop -->
- [Usage](#usage)
- [Commands](#commands)
<!-- tocstop -->

# Usage

<!-- usage -->

```sh-session
$ npm install -g ota-cli
$ ota COMMAND
running command...
$ ota (--version)
ota-cli/0.0.0 win32-x64 node-v16.13.2
$ ota --help [COMMAND]
USAGE
  $ ota COMMAND
...
```

<!-- usagestop -->

```sh-session
$ npm install -g oclif-hello-world
$ oex COMMAND
running command...
$ oex (--version)
oclif-hello-world/0.0.0 darwin-x64 node-v16.13.1
$ oex --help [COMMAND]
USAGE
  $ oex COMMAND
...
```

<!-- usagestop -->

# Commands

<!-- commands -->

- [`ota hello PERSON`](#ota-hello-person)
- [`ota hello world`](#ota-hello-world)
- [`ota help [COMMAND]`](#ota-help-command)
- [`ota plugins`](#ota-plugins)
- [`ota plugins:inspect PLUGIN...`](#ota-pluginsinspect-plugin)
- [`ota plugins:install PLUGIN...`](#ota-pluginsinstall-plugin)
- [`ota plugins:link PLUGIN`](#ota-pluginslink-plugin)
- [`ota plugins:uninstall PLUGIN...`](#ota-pluginsuninstall-plugin)
- [`ota plugins update`](#ota-plugins-update)

## `ota hello PERSON`

Say hello

```
USAGE
  $ ota hello [PERSON] -f <value>

ARGUMENTS
  PERSON  Person to say hello to

FLAGS
  -f, --from=<value>  (required) Whom is saying hello

DESCRIPTION
  Say hello

EXAMPLES
  $ oex hello friend --from oclif
  hello friend from oclif! (./src/commands/hello/index.ts)
```

_See code: [dist/commands/hello/index.ts](https://github.com/d-corler/ota-cli/blob/v0.0.0/dist/commands/hello/index.ts)_

## `ota hello world`

Say hello world

```
USAGE
  $ ota hello world

DESCRIPTION
  Say hello world

EXAMPLES
  $ oex hello world
  hello world! (./src/commands/hello/world.ts)
```

## `ota help [COMMAND]`

Display help for ota.

```
USAGE
  $ ota help [COMMAND] [-n]

ARGUMENTS
  COMMAND  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for ota.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.1.10/src/commands/help.ts)_

## `ota plugins`

List installed plugins.

```
USAGE
  $ ota plugins [--core]

FLAGS
  --core  Show core plugins.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ ota plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.0.11/src/commands/plugins/index.ts)_

## `ota plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ ota plugins:inspect PLUGIN...

ARGUMENTS
  PLUGIN  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ ota plugins:inspect myplugin
```

## `ota plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ ota plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.

  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.

ALIASES
  $ ota plugins add

EXAMPLES
  $ ota plugins:install myplugin

  $ ota plugins:install https://github.com/someuser/someplugin

  $ ota plugins:install someuser/someplugin
```

## `ota plugins:link PLUGIN`

Links a plugin into the CLI for development.

```
USAGE
  $ ota plugins:link PLUGIN

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Links a plugin into the CLI for development.

  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.

EXAMPLES
  $ ota plugins:link myplugin
```

## `ota plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ ota plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ ota plugins unlink
  $ ota plugins remove
```

## `ota plugins update`

Update installed plugins.

```
USAGE
  $ ota plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

<!-- commandsstop -->

- [`oex hello PERSON`](#oex-hello-person)
- [`oex hello world`](#oex-hello-world)
- [`oex help [COMMAND]`](#oex-help-command)
- [`oex plugins`](#oex-plugins)
- [`oex plugins:inspect PLUGIN...`](#oex-pluginsinspect-plugin)
- [`oex plugins:install PLUGIN...`](#oex-pluginsinstall-plugin)
- [`oex plugins:link PLUGIN`](#oex-pluginslink-plugin)
- [`oex plugins:uninstall PLUGIN...`](#oex-pluginsuninstall-plugin)
- [`oex plugins update`](#oex-plugins-update)

## `oex hello PERSON`

Say hello

```
USAGE
  $ oex hello [PERSON] -f <value>

ARGUMENTS
  PERSON  Person to say hello to

FLAGS
  -f, --from=<value>  (required) Whom is saying hello

DESCRIPTION
  Say hello

EXAMPLES
  $ oex hello friend --from oclif
  hello friend from oclif! (./src/commands/hello/index.ts)
```

_See code: [dist/commands/hello/index.ts](https://github.com/oclif/hello-world/blob/v0.0.0/dist/commands/hello/index.ts)_

## `oex hello world`

Say hello world

```
USAGE
  $ oex hello world

DESCRIPTION
  Say hello world

EXAMPLES
  $ oex hello world
  hello world! (./src/commands/hello/world.ts)
```

## `oex help [COMMAND]`

Display help for oex.

```
USAGE
  $ oex help [COMMAND] [-n]

ARGUMENTS
  COMMAND  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for oex.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.1.10/src/commands/help.ts)_

## `oex plugins`

List installed plugins.

```
USAGE
  $ oex plugins [--core]

FLAGS
  --core  Show core plugins.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ oex plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.0.11/src/commands/plugins/index.ts)_

## `oex plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ oex plugins:inspect PLUGIN...

ARGUMENTS
  PLUGIN  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ oex plugins:inspect myplugin
```

## `oex plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ oex plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.

  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.

ALIASES
  $ oex plugins add

EXAMPLES
  $ oex plugins:install myplugin

  $ oex plugins:install https://github.com/someuser/someplugin

  $ oex plugins:install someuser/someplugin
```

## `oex plugins:link PLUGIN`

Links a plugin into the CLI for development.

```
USAGE
  $ oex plugins:link PLUGIN

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Links a plugin into the CLI for development.

  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.

EXAMPLES
  $ oex plugins:link myplugin
```

## `oex plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ oex plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ oex plugins unlink
  $ oex plugins remove
```

## `oex plugins update`

Update installed plugins.

```
USAGE
  $ oex plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

<!-- commandsstop -->
