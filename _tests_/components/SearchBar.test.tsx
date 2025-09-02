import { render } from "@testing-library/react-native";
import React from "react";
import { ThemeProvider } from "styled-components/native";

import SearchBar from "../../components/SearchBar";


describe("SearchBar", () => {
  it("renders without crashing", () => {
    render(
      <ThemeProvider theme={{ colors: {}, spacing: {} }}>
        <SearchBar
          value=""
          onChangeText={() => {}}
          onClear={() => {}}
        />
      </ThemeProvider>
    );
  });
});
