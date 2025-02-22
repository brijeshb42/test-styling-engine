import * as React from "react";
import { getValue } from "@brijeshb42/styling-engine-context/getValue";

export const useContext = React.cache(getValue);
