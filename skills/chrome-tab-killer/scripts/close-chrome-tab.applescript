-- Close a tab by 1-based window index and 1-based tab index.
-- Run: osascript close-chrome-tab.applescript 2 3

on run argv
	if (count of argv) < 2 then error "Usage: osascript close-chrome-tab.applescript <windowIndex> <tabIndex>"
	set winIdx to (item 1 of argv) as integer
	set tabIdx to (item 2 of argv) as integer
	tell application "Google Chrome"
		close tab tabIdx of window winIdx
	end tell
end run
