fx_version 'cerulean'
games { 'gta5' }

author 'droid'
description 'StreamBot Discord Integration'
version '1.0.0'

client_scripts {
    'client.lua'
}

server_scripts {
    'server.lua'
}

server_exports {
    'sendDiscordEvent'
}
