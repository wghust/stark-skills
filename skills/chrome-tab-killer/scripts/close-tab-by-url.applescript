-- Close the first tab whose URL exactly matches the argument (useful to align with CDP url).
-- Run: osascript close-tab-by-url.applescript 'https://github.com/foo/bar'

on run argv
	if (count of argv) < 1 then error "Usage: osascript close-tab-by-url.applescript <url>"
	set targetURL to item 1 of argv as text
	tell application "Google Chrome"
		repeat with w in windows
			repeat with t in tabs of w
				if (URL of t) is targetURL then
					close t
					return
				end if
			end repeat
		end repeat
	end tell
	error "No tab with URL: " & targetURL
end run
