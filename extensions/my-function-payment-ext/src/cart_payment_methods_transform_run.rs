use crate::schema;
use shopify_function::prelude::*;
use shopify_function::Result;

#[derive(Deserialize, Default, PartialEq)]
#[shopify_function(rename_all = "camelCase")]
pub struct Configuration {
    method: String,
    rate: String,
}

#[shopify_function]
fn cart_payment_methods_transform_run(
    input: schema::cart_payment_methods_transform_run::Input,
) -> Result<schema::CartPaymentMethodsTransformRunResult> {
    let no_changes = schema::CartPaymentMethodsTransformRunResult { operations: vec![] };

    let config = match input.payment_customization().metafield() {
        Some(metafield) => metafield.json_value(),
        None => return Ok(no_changes),
    };

    let matching_rate_is_selected = input.cart().delivery_groups().iter().any(|group| {
        group
            .selected_delivery_option()
            .and_then(|option| option.title())
            .is_some_and(|title| title == &config.rate)
    });

    if !matching_rate_is_selected {
        return Ok(no_changes);
    }

    let operation = input
        .payment_methods()
        .iter()
        .find(|method| method.name() != &config.method)
        .map(|method| {
            schema::Operation::PaymentMethodHide(schema::PaymentMethodHideOperation {
                payment_method_id: method.id().clone(),
                placements: None,
            })
        });

    Ok(schema::CartPaymentMethodsTransformRunResult {
        operations: operation.into_iter().collect(),
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use shopify_function::run_function_with_input;

    #[test]
    fn hides_the_first_other_payment_method_for_the_configured_rate() -> Result<()> {
        let result = run_function_with_input(
            cart_payment_methods_transform_run,
            r#"{
                "cart": {
                    "deliveryGroups": [
                        { "selectedDeliveryOption": { "title": "Standard" } }
                    ]
                },
                "paymentMethods": [
                    { "id": "gid://shopify/PaymentMethod/1", "name": "Credit card" },
                    { "id": "gid://shopify/PaymentMethod/2", "name": "Cash on Delivery" }
                ],
                "paymentCustomization": {
                    "metafield": {
                        "jsonValue": { "method": "Credit card", "rate": "Standard" }
                    }
                }
            }"#,
        )?;

        assert_eq!(
            result,
            schema::CartPaymentMethodsTransformRunResult {
                operations: vec![schema::Operation::PaymentMethodHide(
                    schema::PaymentMethodHideOperation {
                        payment_method_id: "gid://shopify/PaymentMethod/2".to_string(),
                        placements: None,
                    },
                )],
            }
        );
        Ok(())
    }

    #[test]
    fn returns_no_operations_without_configuration() -> Result<()> {
        let result = run_function_with_input(
            cart_payment_methods_transform_run,
            r#"{
                "cart": { "deliveryGroups": [] },
                "paymentMethods": [],
                "paymentCustomization": { "metafield": null }
            }"#,
        )?;

        assert!(result.operations.is_empty());
        Ok(())
    }
}
