Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
Start-Sleep -Milliseconds 4000

$text = '£path'
[System.Windows.Forms.Clipboard]::SetText($text)

# Simula Ctrl+V e poi Invio
[System.Windows.Forms.SendKeys]::SendWait('^v')
Start-Sleep -Milliseconds 100
[System.Windows.Forms.SendKeys]::SendWait('{ENTER}')
