import React from "react";
import { mount } from "enzyme";
import axios from "axios";
import sinon from "sinon";
import App from "./App";

describe("App", () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should handle createPlayer function", (done) => {
    const postStub = sandbox.stub(axios, "post");
    const successResponse = { data: "Success" };
    postStub.returns(Promise.resolve(successResponse));

    const wrapper = mount(<App />);
    wrapper.find('input[placeholder="Name"]').simulate("change", {
      target: { value: "John" },
    });
    wrapper.find('input[placeholder="Gold"]').simulate("change", {
      target: { value: "100" },
    });
    // Simulate other input changes

    wrapper.find("button").at(1).simulate("click"); // Click on "Create Player" button

    setTimeout(() => {
      expect(postStub.calledOnce).toBe(true);
      expect(postStub.getCall(0).args[0]).toBe("/players");
      expect(postStub.getCall(0).args[1]).toEqual({
        name: "John",
        gold: "100",
        // Include other properties
      });
      expect(postStub.getCall(0).args[2]).toEqual({
        headers: { Authorization: "" }, // Verify token is empty
      });

      // Assert on the response handling logic

      done();
    }, 0);
  });

  // Write similar test cases for other functions (submitBattle, login, retrieveLeaderboard)
});
