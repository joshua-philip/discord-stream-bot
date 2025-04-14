--[[
    StreamBot Discord Integration - Client Script

    This script handles sending player join/leave events to the Discord bot API.
]]

-- Configuration
local Config = {
    ApiUrl = "http://localhost:3038/api/player/event", -- Replace with your actual API URL
    Debug = false                                      -- Set to true for debug messages
}

-- Variables
local playerConnected = false

-- Helper function for debug messages
function DebugPrint(message)
    if Config.Debug then
        print("[StreamBot Discord] " .. message)
    end
end

-- Function to get Discord ID from player
function GetDiscordId()
    for _, id in ipairs(GetPlayerIdentifiers(PlayerId())) do
        if string.match(id, "discord:") then
            return string.gsub(id, "discord:", "")
        end
    end
    return nil
end

-- Function to send event to Discord bot API
function SendDiscordEvent(action)
    local discordId = GetDiscordId()

    if not discordId then
        DebugPrint("No Discord ID found for player")
        return
    end

    DebugPrint("Sending " .. action .. " event for Discord ID: " .. discordId)

    -- Get the secret key from the server
    TriggerServerEvent("streamBot:getSecretKey", action, discordId)
end

-- Event handler when the server provides the secret key
RegisterNetEvent("streamBot:sendEventWithKey")
AddEventHandler("streamBot:sendEventWithKey", function(action, discordId, secretKey)
    -- Ensure we have all required data
    if not action or not discordId or not secretKey then
        DebugPrint("Missing data for API request")
        return
    end

    DebugPrint("Received secret key, sending API request")

    -- Prepare the request data
    local requestData = {
        action = action,
        playerId = discordId,
        secret = secretKey
    }

    -- Send the request to the API
    PerformHttpRequest(Config.ApiUrl, function(errorCode, resultData, resultHeaders)
        if errorCode == 200 then
            DebugPrint("Successfully sent " .. action .. " event to Discord bot")
        else
            DebugPrint("Failed to send event to Discord bot: " .. tostring(errorCode))
            if resultData then
                DebugPrint("Response: " .. resultData)
            end
        end
    end, "POST", json.encode(requestData), { ["Content-Type"] = "application/json" })
end)

-- Event handlers for player join
RegisterNetEvent("playerSpawned")
AddEventHandler("playerSpawned", function()
    if not playerConnected then
        -- Only trigger this once per connection
        playerConnected = true

        -- Small delay to ensure identifiers are fully loaded
        Citizen.Wait(2000)
        SendDiscordEvent("join")
    end
end)

-- Handle player leaving when resource stops
AddEventHandler("onResourceStop", function(resource)
    if resource == GetCurrentResourceName() then
        if playerConnected then
            SendDiscordEvent("leave")
        end
    end
end)

-- Handle explicit cleanup request from server
RegisterNetEvent("streamBot:cleanup")
AddEventHandler("streamBot:cleanup", function()
    if playerConnected then
        SendDiscordEvent("leave")
        playerConnected = false
    end
end)

-- Initial setup
Citizen.CreateThread(function()
    DebugPrint("Discord integration initialized")
end)
