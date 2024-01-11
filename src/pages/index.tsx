import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import { Box, Button, Input, Text,List } from "@saleor/macaw-ui";
import { NextPage } from "next";
import Link from "next/link";
import { MouseEventHandler, useEffect, useState } from "react";
import Head from 'next/head';


const AddToSaleorForm = () => (
  <Box
    as={"form"}
    display={"flex"}
    alignItems={"center"}
    gap={4}
    onSubmit={(event) => {
      event.preventDefault();

      const saleorUrl = new FormData(event.currentTarget as HTMLFormElement).get("saleor-url");
      const manifestUrl = new URL("/api/manifest", window.location.origin);
      const redirectUrl = new URL(
        `/dashboard/apps/install?manifestUrl=${manifestUrl}`,
        saleorUrl as string
      ).href;

      window.open(redirectUrl, "_blank");
    }}
  >
    <Input type="url" required label="Saleor URL" name="saleor-url" />
    <Button type="submit">Add to Saleor</Button>
  </Box>
);

/**
 * This is page publicly accessible from your app.
 * You should probably remove it.
 */
const IndexPage: NextPage = () => {
  const { appBridgeState, appBridge } = useAppBridge();
  const [mounted, setMounted] = useState(false);
  const url = appBridgeState?.saleorApiUrl!
  useEffect(() => {
    getTenantList()
    setMounted(true);
  }, []);

  const [tenants,setTenants]=useState<any[]>([]);
  const [tip,setTip]=useState<any>();
  
  const getTenantList=async ()=>{
    const response = await fetch("https://api.wzrefractory.com/customers/list-tenant", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer  `
      },
      
    });
    if (response.status !== 200) {
      console.log(`Could not get the tenant list ${response.status}`);
      return void 0;
    }
    const body = await response.json();
    console.log(body.data)
    setTenants(body.data)
    return "OK";
  } 
  

  const handleLinkClick: MouseEventHandler<HTMLAnchorElement> = (e) => {
    /**
     * In iframe, link can't be opened in new tab, so Dashboard must be a proxy
     */
    if (appBridgeState?.ready) {
      e.preventDefault();

      appBridge?.dispatch(
        actions.Redirect({
          newContext: true,
          to: e.currentTarget.href,
        })
      );
    }

    /**
     * Otherwise, assume app is accessed outside of Dashboard, so href attribute on <a> will work
     */
  };

  

  const isLocalHost = global.location.href.includes("localhost");

  return (
    <>
    
    <Box padding={8}>
        <Text variant={"hero"}>all tenants list below</Text>

        <List display={"flex"} gridRow={"auto"} flexDirection={"row"}>
          {tenants.map(item => {
            return <Box style={{"margin":"20px","backgroundColor":"#c9c7c7"}} display="flex" flexDirection={"column"} gap={1} key={item.id}>
              <Text>
                nick name: {item.name}
              </Text>
              <Text>
                domain: {item.domain}
              </Text>
              <Text>
                schema name: {item.schema}
              </Text>
              <Text>
                status: {item.status}
              </Text>
              <Text>
                create on: {item.created_on}
              </Text>
            </Box>;
          })}
        </List>
        <div>
          {/* 添加租户 */}
          <Box as={"form"} display={"flex"} alignItems={"center"} gap={4}
              onSubmit={async (event) => {
                event.preventDefault();
                setTip("正在添加租户");
                const schemaName = new FormData(event.currentTarget as HTMLFormElement).get("schemaName");
                const userName = new FormData(event.currentTarget as HTMLFormElement).get("userName");
                const domainName = new FormData(event.currentTarget as HTMLFormElement).get("domainName");
                const data={"schemaName":schemaName,"userName":userName,"domainName":domainName}
                const response = await fetch("https://api.wzrefractory.com/customers/add-tenant", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer  `
                },
                body:JSON.stringify(data)
              });
              if (response.status !== 200) {
                console.log(`Could not add the tenant list ${response.status}`);
                setTip(`Could not add the tenant list ${response.status}`);
                return void 0;
              }
              const body = await response.json();
              if(body.code == '1'){
                if(body.message.indexOf("finish") > -1){
                  console.log("finish")
                  setTip("finish")
                }else{
                  console.log("please wait,"+body.message)
                  setTip("please wait,"+body.message)
                }
                getTenantList()
              }else{
                console.log(body.message)
                setTip(body.message)
              }
              setTimeout(function(){
                setTip("");
              },3000)
              }}
            >
            <Input type="text" required label="scheam name" name="schemaName" />
            <Input type="text" required label="nick name" name="userName" />
            <Input type="text" required label="domain" name="domainName" />
            <Button type="submit">Add Tenant</Button>
            <Text>
              { tip }
            </Text>
          </Box>
        </div>


        {appBridgeState?.ready && mounted && (
          <Link href="/actions">
            <Button variant="secondary">See what your app can do →</Button>
          </Link>
        )}

        <Text as={"p"} marginTop={8}>
          Explore the App Template by visiting:
        </Text>
        <ul>
          <li>
            <code>/src/pages/api/manifest</code> - the{" "}
            <a
              href="https://docs.saleor.io/docs/3.x/developer/extending/apps/manifest"
              target="_blank"
              rel="noreferrer"
            >
              App Manifest
            </a>
            .
          </li>
          <li>
            <code>/src/pages/api/webhooks/order-created</code> - an example <code>ORDER_CREATED</code>{" "}
            webhook handler.
          </li>
          <li>
            <code>/graphql</code> - the pre-defined GraphQL queries.
          </li>
          <li>
            <code>/generated/graphql.ts</code> - the code generated for those queries by{" "}
            <a target="_blank" rel="noreferrer" href="https://the-guild.dev/graphql/codegen">
              GraphQL Code Generator
            </a>
            .
          </li>
        </ul>
        <Text variant={"heading"} marginTop={8} as={"h2"}>
          Resources
        </Text>
        <ul>
          <li>
            <a
              onClick={handleLinkClick}
              target="_blank"
              href="https://docs.saleor.io/docs/3.x/developer/extending/apps/key-concepts"
              rel="noreferrer"
            >
              <Text color={"text3Decorative"}>Apps documentation </Text>
            </a>
          </li>
          <li>
            <a
              onClick={handleLinkClick}
              target="_blank"
              rel="noreferrer"
              href="https://docs.saleor.io/docs/3.x/developer/extending/apps/developing-with-tunnels"
            >
              <Text color={"text3Decorative"}>Tunneling the app</Text>
            </a>
          </li>
          <li>
            <a
              onClick={handleLinkClick}
              target="_blank"
              rel="noreferrer"
              href="https://github.com/saleor/app-examples"
            >
              <Text color={"text3Decorative"}>App Examples repository</Text>
            </a>
          </li>

          <li>
            <a
              onClick={handleLinkClick}
              target="_blank"
              rel="noreferrer"
              href="https://github.com/saleor/saleor-app-sdk"
            >
              <Text color={"text3Decorative"}>Saleor App SDK</Text>
            </a>
          </li>

          <li>
            <a
              onClick={handleLinkClick}
              target="_blank"
              href="https://github.com/saleor/saleor-cli"
              rel="noreferrer"
            >
              <Text color={"text3Decorative"}>Saleor CLI</Text>
            </a>
          </li>
          <li>
            <a
              onClick={handleLinkClick}
              target="_blank"
              href="https://github.com/saleor/apps"
              rel="noreferrer"
            >
              <Text color={"text3Decorative"}>Saleor App Store - official apps by Saleor Team</Text>
            </a>
          </li>
          <li>
            <a
              onClick={handleLinkClick}
              target="_blank"
              href="https://macaw-ui-next.vercel.app/?path=/docs/getting-started-installation--docs"
              rel="noreferrer"
            >
              <Text color={"text3Decorative"}>Macaw UI - official Saleor UI library</Text>
            </a>
          </li>
          <li>
            <a
              onClick={handleLinkClick}
              target="_blank"
              href="https://nextjs.org/docs"
              rel="noreferrer"
            >
              <Text color={"text3Decorative"}>Next.js documentation</Text>
            </a>
          </li>
        </ul>

        {mounted && !isLocalHost && !appBridgeState?.ready && (
          <>
            <Text marginBottom={4} as={"p"}>
              Install this app in your Dashboard and get extra powers!
            </Text>
            <AddToSaleorForm />
          </>
        )}
      </Box>
    </>
  );
};

export default IndexPage ;
