import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Container from '@material-ui/core/Container';
import NavBar from '../NavBar';
import Dashboard from '../components/Dashboard/Dashboard';
import Instance from '../components/Instance/InstanceWrapper';
import NotFound from '../../ui/pages/NotFound'


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      contentStyle: { height: window.innerHeight - 64 }
    }
    this.onResize = this.onResize.bind(this);
  }
  componentDidMount() {
    window.addEventListener('resize', () => this.onResize())
  }
  onResize() {
    let contentStyle = { height: window.innerHeight - 64, width: window.innerWidth }
    this.setState({ contentStyle })
  }
  render() {
    return (
      <Container maxWidth={false} className="root-container">
        <NavBar title="NetPrune" bg="#34425a" />
        <Container maxWidth={false} className="content-container" style={this.state.contentStyle}>
          <BrowserRouter>
            <Routes>
              <Route exact path="/" element={<Dashboard />} />
              <Route path="/instance/:id" style={this.state.contentStyle} element={<Instance />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </Container>
      </Container>
    )
  }
}

export default App;
