Add-Type -AssemblyName System.Windows.Forms
$text = '£path'
Write-Output $text
[System.Windows.Forms.SendKeys]::SendWait($text + '{ENTER}')