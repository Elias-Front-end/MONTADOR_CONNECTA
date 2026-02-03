-- CHECK_TABLES.sql
SELECT 
    t.table_name, 
    c.column_name, 
    c.data_type 
FROM 
    information_schema.tables t
LEFT JOIN 
    information_schema.columns c ON t.table_name = c.table_name 
WHERE 
    t.table_schema = 'public' 
    AND t.table_name IN ('services', 'users', 'profiles')
ORDER BY 
    t.table_name, c.column_name;
