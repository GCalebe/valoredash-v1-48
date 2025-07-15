@echo off
echo Reparando todas as migracoes restantes...

echo Revertendo migracoes restantes...
npx supabase migration repair --status reverted 20250615034126
npx supabase migration repair --status reverted 20250615035721
npx supabase migration repair --status reverted 20250615041030
npx supabase migration repair --status reverted 20250615043221
npx supabase migration repair --status reverted 20250615055443
npx supabase migration repair --status reverted 20250615083936
npx supabase migration repair --status reverted 20250615090530
npx supabase migration repair --status reverted 20250616022413
npx supabase migration repair --status reverted 20250616023715
npx supabase migration repair --status reverted 20250704042530
npx supabase migration repair --status reverted 20250704042612
npx supabase migration repair --status reverted 20250704042812
npx supabase migration repair --status reverted 20250704042838
npx supabase migration repair --status reverted 20250706095249
npx supabase migration repair --status reverted 20250706095339
npx supabase migration repair --status reverted 20250706095724
npx supabase migration repair --status reverted 20250706100008

echo Reparo concluido!
echo Verificando status das migracoes...
npx supabase migration list

echo.
echo Fazendo pull para sincronizar com o banco remoto...
npx supabase db pull

echo.
echo Tentando fazer push das migracoes...
npx supabase db push

pause