import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { Box, Text } from "@saleor/macaw-ui/next";
import React from "react";
import { useLastOrderQuery } from "../generated/graphql";
import gql from "graphql-tag";
import Link from "next/link";

gql`
  query LastOrder {
    orders(first: 1) {
      edges {
        node {
          id
          number
          created
          user {
            firstName
            lastName
          }
          shippingAddress {
            country {
              country
            }
          }
          total {
            gross {
              amount
              currency
            }
          }
          lines {
            id
          }
        }
      }
    }
  }
`;

function generateNumberOfLinesText(lines: any[]) {
  if (lines.length === 0) {
    return "no lines";
  }

  if (lines.length === 1) {
    return "1 line";
  }

  return `${lines.length} lines`;
}

export const OrderExample = () => {
  const { appBridge } = useAppBridge();

  const [{ data, fetching }] = useLastOrderQuery();
  const lastOrder = data?.orders?.edges[0]?.node;

  const navigateToOrder = (id: string) => {
    appBridge?.dispatch({
      type: "redirect",
      payload: {
        to: `/orders/${id}`,
        actionId: "message-from-app",
      },
    });
  };

  return (
    <Box display="flex" flexDirection={"column"} gap={2}>
      <Text as={"h2"} variant={"heading"}>
        Fetching data
      </Text>

      <>
        {fetching && <Text color="textNeutralSubdued">Fetching the last order...</Text>}
        {lastOrder && (
          <>
            <Text color="textNeutralSubdued">
              💡 You can modify the query in the <code>/graphql/queries/Orders.graphql</code> file.
              Remember to run <code>pnpm codegen</code> command afterwards to regenerate the types.
            </Text>
            <Box
              backgroundColor={"subdued"}
              padding={4}
              borderRadius={4}
              borderWidth={1}
              borderStyle={"solid"}
              borderColor={"neutralDefault"}
              marginY={4}
            >
              <Text>{`The last order #${lastOrder.number}:`}</Text>
              <ul>
                <li>
                  <Text>{`Contains ${generateNumberOfLinesText(lastOrder.lines)} 🛒`}</Text>
                </li>
                <li>
                  <Text>{`For a total amount of ${lastOrder.total.gross.amount} ${lastOrder.total.gross.currency} 💸`}</Text>
                </li>
                <li>
                  <Text>{`Ships to ${lastOrder.shippingAddress?.country.country} 📦`}</Text>
                </li>
              </ul>
              <Link onClick={() => navigateToOrder(lastOrder.id)} href={`/orders/${lastOrder.id}`}>
                See the order details →
              </Link>
            </Box>
          </>
        )}
        {!fetching && !lastOrder && <Text color="textNeutralSubdued">No orders found</Text>}
      </>
    </Box>
  );
};
