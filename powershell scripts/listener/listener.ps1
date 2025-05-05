# Configurazione
$folder = "C:\Users\cordo\Il mio Drive\PNC\Code\Chrome extensions\BGRemover\source\powershell scripts\listened"
$scriptSecondario = "listened.ps1"
$pathSecondario = Join-Path $folder $scriptSecondario

while ($true) {
    if (Test-Path $pathSecondario) {
        Write-Host "Trovato $scriptSecondario. Avvio esecuzione..."

        # Esegui lo script secondario e aspetta che termini
        $process = Start-Process -FilePath "powershell.exe" `
                                 -ArgumentList "-ExecutionPolicy Bypass -File `"$pathSecondario`"" `
                                 -Wait `
                                 -NoNewWindow `
                                 -PassThru

        # Dopo l'esecuzione, controlla se il file esiste ancora e rimuovilo
        if (Test-Path $pathSecondario) {
            try {
                Remove-Item $pathSecondario -Force
                Write-Host "$scriptSecondario eliminato."
            } catch {
                Write-Warning "Impossibile eliminare lo script: $_"
            }
        }
    }

    # Aspetta un po' prima di controllare di nuovo
    Start-Sleep -Seconds 5
}
