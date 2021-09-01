import React from "react";

import RequestStatus from "./RequestStatus";
import { RestContext } from "./RestContext";
import { objectToQuery } from "./Utils";

export class RequestRenderer extends React.Component {
  static contextType = RestContext.Context;

  constructor(props) {
    super(props);

    this.state = {
      status: RequestStatus.LOADING,
    };
  }

  async sendRequest(url) {
    const request = await fetch(url, {
      method: this.props.method || "get",
      body: this.props.body,
      headers: this.props.headers,
    }).catch((e) => {
      this.setState({
        status: RequestStatus.ERROR,
        error: e,
      });

      return null;
    });

    if (request) {
      const statusCode = await request.status;
      const data = await request.json();

      this.setState({
        status: RequestStatus.DATA,
        data,
        statusCode,
      });
    }
  }

  componentWillUpdate(_, nextState) {
    if (this.state === nextState && this.props.static !== true) {
      this.setState({
        status: RequestStatus.LOADING,
      });
    }
  }

  render() {
    if (this.state.status === RequestStatus.LOADING) {
      this.sendRequest(
        new URL(
          this.props.path + objectToQuery(this.props.query),
          this.context.url
        ).href
      );
    }

    const { onData, onLoading, onError } = this.props;

    switch (this.state.status) {
      case RequestStatus.DATA:
        return onData ? onData(this.state.data, this.state.statusCode) : null;
      case RequestStatus.ERROR:
        return onError ? onError(this.state.error) : null;
      default:
        return onLoading ? onLoading() : null;
    }
  }
}
