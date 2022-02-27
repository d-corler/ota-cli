# ota-cli

[![Version](https://img.shields.io/github/package-json/v/d-corler/ota-cli?style=flat-square)](https://github.com/d-corler/ota-cli/blob/main/)
[![Version](https://img.shields.io/npm/v/ota-cli?style=flat-square)](https://npmjs.org/package/ota-cli)
[![License](https://img.shields.io/github/license/d-corler/ota-cli?style=flat-square)](https://github.com/d-corler/ota-cli/blob/main/LICENSE)
[![License](https://img.shields.io/github/issues/d-corler/ota-cli?style=flat-square)](https://github.com/d-corler/ota-cli/issues)

Uploads firmware over the air to devices like Arduino, ESP8266, ESP32, etc.

Authentication supported.

# Summary

<!-- toc -->

- [ota-cli](#ota-cli)
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
ota-cli/0.1.0-pre win32-x64 node-v16.13.2
$ ota --help [COMMAND]
USAGE
  $ ota COMMAND
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
- [`ota upload`](#ota-upload)

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

_See code: [dist/commands/hello/index.ts](https://github.com/d-corler/ota-cli/blob/v0.1.0-pre/dist/commands/hello/index.ts)_

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

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.0.12/src/commands/plugins/index.ts)_

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

## `ota upload`

Upload a firmware to a device

```
USAGE
  $ ota upload -f <value> -i <value> [--deviceIp <value>] [--devicePass <value> ] [--dnsServiceName <value>]
    [--dnsServiceType <value>]

FLAGS
  -f, --file=path/to/firmware.bin  (required) Path to the firmware binary file
  -i, --interface=<value>          (required) Provide IP of your default local network interface
  --deviceIp=path/to/firmware.bin  Skip the scanning step by providing the device IP address directly
  --devicePass=<value>             Skip the authentication step by providing the password directly
  --dnsServiceName=<value>         [default: _arduino._tcp.local] Provide the name of the DNS service to lookup
  --dnsServiceType=<value>         [default: PTR] Provide the type of the DNS service to lookup

DESCRIPTION
  Upload a firmware to a device
```

_See code: [dist/commands/upload/index.ts](https://github.com/d-corler/ota-cli/blob/v0.1.0-pre/dist/commands/upload/index.ts)_

<!-- commandsstop -->
