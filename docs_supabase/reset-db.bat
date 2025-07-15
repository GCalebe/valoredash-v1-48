@echo off
echo Resetando o banco de dados para resolver conflitos de migração...
echo AVISO: Isso irá apagar todos os dados do banco!
echo.
pause

echo Executando reset do banco...
npx supabase db reset

echo.
echo Reset concluído! Verificando status das migrações...
npx supabase migration list

echo.
echo Agora você pode executar: npx supabase db push
pause