-- Close every tab whose URL does not contain "localhost:3000".
-- Run: osascript close-tabs-except-localhost-3000.applescript

tell application "Google Chrome"
	repeat
		set anyClosed to false
		repeat with w in windows
			set tc to count of tabs of w
			repeat with i from tc to 1 by -1
				try
					set t to tab i of w
					set u to URL of t
					if u does not contain "localhost:3000" then
						close t
						set anyClosed to true
						exit repeat
					end if
				end try
			end repeat
			if anyClosed then exit repeat
		end repeat
		if not anyClosed then exit repeat
	end repeat
end tell
