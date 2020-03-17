import React from "react";
import "./App.css";

type Action =
  | { type: "typing"; value: string }
  | { type: "fetching" }
  | { type: "success"; payload: string }
  | { type: "error"; code: string };

interface State {
  isFetching: boolean;
  isSuccessful: boolean;
  errorMessage: string;
  result: string;
  userIdValue: string;
}

const initialState: State = {
  isFetching: false,
  isSuccessful: false,
  errorMessage: "",
  result: "",
  userIdValue: "1"
};

const appReducer = (state: State, action: Action) => {
  switch (action.type) {
    case "fetching":
      return {
        ...state,
        isFetching: true,
        isSuccessful: false,
        errorMessage: "",
        result: ""
      };

    case "typing":
      return { ...state, userIdValue: action.value };

    case "success":
      return {
        ...state,
        isFetching: false,
        isSuccessful: true,
        result: action.payload
      };

    case "error":
      return {
        ...state,
        isFetching: false,
        errorMessage: `Request failed. Error: ${action.code}`
      };
  }
};

const App = () => {
  const [
    { isSuccessful, isFetching, userIdValue, errorMessage, result },
    dispatch
  ] = React.useReducer(appReducer, initialState);

  const fetchUserInfo = () => {
    fetch(`https://reqres.in/api/users/${userIdValue}?delay=5`)
      .then(response =>
        response.status === 200
          ? Promise.resolve(response.json())
          : Promise.reject(response.status)
      )
      .then(data => {
        dispatch({
          type: "success",
          payload: JSON.stringify(data, undefined, 2)
        });
      })
      .catch(err => {
        dispatch({ type: "error", code: err });
      });
  };

  const onValueChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: "typing", value: event.target.value });
  };

  const onFetchClicked = (
    event: React.MouseEvent<HTMLInputElement, MouseEvent>
  ) => {
    event.preventDefault();
    dispatch({ type: "fetching" });
    fetchUserInfo();
  };

  return (
    <div className="App">

      <form noValidate autoComplete="off">
        <label>
          Enter User ID (1-12)
          <input
            type="text"
            id="userId"
            name="userId"
            required
            onChange={onValueChanged}
            value={userIdValue}
            disabled={isFetching}
          />
        </label>
        <input
          type="submit"
          value="Fetch"
          onClick={onFetchClicked}
          disabled={isFetching}
        />

        {isFetching && (
          <label className="status">
            Fetching data. Please wait (max wait: 5 seconds)...
          </label>
        )}
        {!isSuccessful && errorMessage.length > 0 && (
          <label className="error">{errorMessage}</label>
        )}
      </form>

      {isSuccessful && (
        <div className="result">
          <h2>Result</h2>

          <pre>
            <code>{result}</code>
          </pre>
        </div>
      )}

    </div>
  );
};

export default App;
