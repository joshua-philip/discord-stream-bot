--[[
    StreamBot Discord Integration - Server Script

    This script serves as the server-side component for the Discord integration.
]]

-- Configuration
local Config = {
    SecretKey = "your_secret_key_here", -- IMPORTANT: Replace with the same secret key used in your Discord bot
    Debug = true                        -- Set to true for debug messages
}

-- Helper function for debug messages
function DebugPrint(message)
    if Config.Debug then
        print("[StreamBot Discord] " .. message)
    end
end

-- Provide the secret key to the client when requested
RegisterServerEvent("streamBot:getSecretKey")
AddEventHandler("streamBot:getSecretKey", function(action, discordId)
    local source = source

    -- Validate the request
    if not action or not discordId then
        DebugPrint("Invalid request from player " .. source)
        return
    end

    -- Basic validation of action type
    if action ~= "join" and action ~= "leave" then
        DebugPrint("Invalid action type: " .. action)
        return
    end

    -- Send the secret key back to the client
    DebugPrint("Providing secret key for " .. action .. " event to player " .. source)
    TriggerClientEvent("streamBot:sendEventWithKey", source, action, discordId, Config.SecretKey)
end)

-- Handle player disconnects
AddEventHandler("playerDropped", function(reason)
    local source = source
    DebugPrint("Player " .. source .. " disconnected: " .. reason)

    -- Find Discord ID directly from server-side
    local discordId = nil
    for _, id in ipairs(GetPlayerIdentifiers(source)) do
        if string.match(id, "discord:") then
            discordId = string.gsub(id, "discord:", "")
            break
        end
    end

    if discordId then
        -- We can make the API call directly from server-side to handle disconnects more reliably
        local requestData = {
            action = "leave",
            playerId = discordId,
            secret = Config.SecretKey
        }

        PerformHttpRequest("http://localhost:3038/api/player/event", function(errorCode, resultData, resultHeaders)
            if errorCode == 200 then
                DebugPrint("Successfully sent leave event to Discord bot for " .. discordId)
            else
                DebugPrint("Failed to send leave event to Discord bot: " .. tostring(errorCode))
                if resultData then
                    DebugPrint("Response: " .. resultData)
                end
            end
        end, "POST", json.encode(requestData), { ["Content-Type"] = "application/json" })
    else
        DebugPrint("No Discord ID found for disconnected player " .. source)
    end
end)

-- Initialize
DebugPrint("Server-side Discord integration initialized")

-- Add exports if needed for other resources
exports("sendDiscordEvent", function(playerId, action)
    -- Can be used by other resources to trigger Discord events
    if GetPlayerPing(playerId) > 0 then -- Check if player exists
        TriggerClientEvent("streamBot:sendEvent", playerId, action)
        return true
    end
    return false
end)
