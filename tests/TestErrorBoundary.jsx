import { Component } from "react";

export default class TestErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return <div>CRASHED: {this.state.error.message}</div>;
    }
    return this.props.children;
  }
}
