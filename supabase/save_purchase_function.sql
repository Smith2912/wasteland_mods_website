-- Function to handle purchase saving with detailed error reporting
create or replace function save_purchase(
  p_user_id uuid,
  p_mod_id text,
  p_transaction_id text,
  p_amount numeric,
  p_status text
) returns json language plpgsql security definer as $$
declare
  new_purchase_id uuid;
  result json;
begin
  -- Insert the purchase record
  insert into purchases (user_id, mod_id, transaction_id, purchase_date, amount, status)
  values (p_user_id, p_mod_id, p_transaction_id, now(), p_amount, p_status)
  returning id into new_purchase_id;
  
  -- Return success with the purchase ID
  result := json_build_object(
    'success', true,
    'purchase_id', new_purchase_id
  );
  
  return result;
exception
  when others then
    -- Return the error with detailed information
    result := json_build_object(
      'success', false,
      'error', SQLERRM,
      'error_detail', SQLSTATE
    );
    
    return result;
end;
$$;

-- Grant access to the function for authenticated users
grant execute on function save_purchase to authenticated;
grant execute on function save_purchase to service_role; 