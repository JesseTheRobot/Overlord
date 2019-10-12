>nul find "{" UserData.json && (
  echo "{" was found.
  "{}" > UserData.json
) || (
  echo "{" was NOT found.
)
pause