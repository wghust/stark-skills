-- List all Chrome windows/tabs as TSV: windowIndex TAB tabIndex TAB title TAB url
-- Run: osascript list-chrome-tabs.applescript
-- Note: use ASCII 9 for TAB (AppleScript "tab" token can misparse in some contexts)

on run
	set sep to ASCII character 9
	set out to ""
	tell application "Google Chrome"
		set widx to 0
		repeat with w in windows
			set widx to widx + 1
			set tidx to 0
			repeat with t in tabs of w
				set tidx to tidx + 1
				set ti to title of t
				set u to URL of t
				set out to out & (widx as text) & sep & (tidx as text) & sep & ti & sep & u & linefeed
			end repeat
		end repeat
	end tell
	return out
end run
