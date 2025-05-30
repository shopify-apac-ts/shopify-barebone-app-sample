use shopify_function::prelude::*;
use shopify_function::Result;

use serde::{Deserialize, Serialize};

// Use stderr for debug logging
//use std::io::{self, Write};

generate_types!(
    query_path = "./input.graphql",
    schema_path = "./schema.graphql"
);


#[derive(Serialize, Deserialize, Default, PartialEq)]
#[serde(rename_all(deserialize = "camelCase"))]
struct Configuration {

}

#[shopify_function]
fn function(input: input::ResponseData) -> Result<output::FunctionResult> {
    // Debug logging
    //io::stderr().write_fmt(format_args!("{:#?}", 999));

    // Read https://shopify.dev/docs/api/functions/reference/order-discounts/graphql/input 
    // and ./input.graphql and schema.graphql
    let discount_rate = match input.cart.attribute {
        Some(attribute) => match attribute.value {
            Some(value) => value.to_string(),
            None => "0.0".to_string()
        },
        None => match input.cart.buyer_identity {
            Some(buyer_identity) => match buyer_identity.customer {
                Some(customer) => match customer.metafield {
                    Some(metafield) => metafield.value.to_string(),
                    None => "0.0".to_string()
                },
                None => "0.0".to_string()
            },
            None => "0.0".to_string()
        }
    };

   // Read https://shopify.dev/api/functions/reference/order-discounts/graphql/functionresult
    Ok(output::FunctionResult {
        discounts: vec![output::Discount {
            message: Some("Function order discount worked!".to_string()),
            targets: vec![output::Target{
                order_subtotal: Some(output::OrderSubtotalTarget {
                    excluded_variant_ids: vec![]
                }),
                product_variant: None
            }],
            value: output::Value {
                percentage: Some(output::Percentage {
                    value: discount_rate
                }),
                fixed_amount: None
            },
            conditions: None
        }],
        discount_application_strategy: output::DiscountApplicationStrategy::FIRST,
    })
}

#[cfg(test)]
mod tests;