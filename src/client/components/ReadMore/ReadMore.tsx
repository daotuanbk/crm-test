import React from 'react';
import Truncate from 'react-truncate';

interface State {
  expanded: boolean;
  truncated: boolean;
}

interface Props {
  more: any;
  less: any;
  lines: number;
}

export class ReadMore extends React.Component<Props, State> {
  static defaultProps = {
    lines: 3,
    more: 'Show more',
    less: 'Show less',
  };
  constructor(props: any) {
    super(props);

    this.state = {
      expanded: false,
      truncated: false,
    };

    this.handleTruncate = this.handleTruncate.bind(this);
    this.toggleLines = this.toggleLines.bind(this);
  }

  handleTruncate(truncated: any) {
    if (this.state.truncated !== truncated) {
      this.setState({
        truncated,
      });
    }
  }

  toggleLines(event: any) {
    event.preventDefault();

    this.setState({
      expanded: !this.state.expanded,
    });
  }

  render() {
    const {
      children,
      more,
      lines,
    } = this.props;

    const {
      expanded,
    } = this.state;

    const style = {cursor: 'pointer', color: '#0289ff'};
    return (
        <div>
          <Truncate
              lines={!expanded && lines}
              ellipsis={(
                  <span>... <span style={style} onClick={this.toggleLines}>{more}</span></span>
              )}
              onTruncate={this.handleTruncate}
          >
            <span dangerouslySetInnerHTML={{__html: `${children}`}}></span>
          </Truncate>
        </div>
    );
  }
}
