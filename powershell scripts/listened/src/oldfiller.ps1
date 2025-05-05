Add-Type -AssemblyName System.Windows.Forms
Start-Sleep -Milliseconds 4000
$text = '"£path"'
Write-Output $text
#l'eventuale presenza di un % nel percorso viene recepita da Winzoz Form
#come ALT, ma sembra non ci sia un modo per farne l'escaping
[System.Windows.Forms.SendKeys]::SendWait($text + '{ENTER}')