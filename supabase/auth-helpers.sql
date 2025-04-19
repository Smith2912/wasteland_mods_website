-- Helper functions for authentication debugging and verification

-- Function to check if a user exists and list their auth providers
create or replace function check_user_auth(user_id uuid)
returns json language plpgsql security definer as $$
declare
  user_data json;
  identity_data json;
  result json;
begin
  -- Check if user exists in auth.users
  select 
    json_build_object(
      'id', id,
      'email', email,
      'created_at', created_at,
      'last_sign_in_at', last_sign_in_at,
      'provider', raw_app_meta_data->>'provider',
      'providers', raw_app_meta_data->'providers'
    ) into user_data
  from auth.users
  where id = user_id;
  
  -- Get identity providers for the user
  select json_agg(
    json_build_object(
      'id', id,
      'provider', provider, 
      'identity_data', identity_data,
      'created_at', created_at,
      'last_sign_in_at', last_sign_in_at
    )
  ) into identity_data
  from auth.identities
  where user_id = check_user_auth.user_id;
  
  -- Build result
  result := json_build_object(
    'user_exists', user_data is not null,
    'user_data', user_data,
    'identity_providers', identity_data,
    'timestamp', now()
  );

  return result;
exception
  when others then
    return json_build_object(
      'success', false,
      'error', SQLERRM,
      'error_detail', SQLSTATE
    );
end;
$$;

-- Grant access to the function
grant execute on function check_user_auth to authenticated;
grant execute on function check_user_auth to service_role;

-- Function to count users by provider
create or replace function count_users_by_provider()
returns json language plpgsql security definer as $$
declare
  result json;
begin
  select json_build_object(
    'total_users', count(*),
    'discord_users', count(*) filter (where raw_app_meta_data->>'provider' = 'discord' or raw_app_meta_data->'providers' ? 'discord'),
    'steam_users', count(*) filter (where raw_user_meta_data->>'steamId' is not null),
    'users_with_purchases', (select count(distinct user_id) from public.purchases),
    'timestamp', now()
  ) into result
  from auth.users;

  return result;
exception
  when others then
    return json_build_object(
      'success', false,
      'error', SQLERRM,
      'error_detail', SQLSTATE
    );
end;
$$;

-- Grant access to the function
grant execute on function count_users_by_provider to service_role;

-- Function to check database schema for auth tables access
create or replace function check_auth_schema_access()
returns json language plpgsql security definer as $$
declare
  result json;
begin
  -- Test if we can access auth schema tables
  begin
    perform count(*) from auth.users limit 1;
    perform count(*) from auth.identities limit 1;
    
    result := json_build_object(
      'can_access_auth_users', true,
      'can_access_auth_identities', true,
      'timestamp', now()
    );
  exception
    when insufficient_privilege then
      result := json_build_object(
        'can_access_auth_users', false,
        'error', 'Permission denied to access auth schema tables',
        'solution', 'Grant permissions or use service_role key'
      );
    when undefined_table then 
      result := json_build_object(
        'can_access_auth_users', false,
        'error', 'Auth tables not found',
        'solution', 'Check database schema configuration'
      );
    when others then
      result := json_build_object(
        'success', false,
        'error', SQLERRM,
        'error_detail', SQLSTATE
      );
  end;

  return result;
end;
$$;

-- Grant access to the function
grant execute on function check_auth_schema_access to service_role; 