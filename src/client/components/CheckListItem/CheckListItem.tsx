import { Row, Col, Checkbox } from 'antd';
import './CheckListItem.less';

interface Props {
  color: string;
  text: any;
  subtext: string;
  onChangeCheckbox?: (checked: boolean) => void;
  onClickText?: () => void;
  renderCheckbox?: () => any;
  lineThroughText?: boolean;
}

export const CheckListItem = (_props: Props) => {
  return (
    <Row type='flex' gutter={10}>
      <Col xs={2}>
          {
              _props.renderCheckbox ? _props.renderCheckbox() : (
                  <Checkbox onChange={(e: any) => {
                      if (_props.onChangeCheckbox) _props.onChangeCheckbox(e.target.checked);
                  }}/>
              )
          }
      </Col>
      <Col xs={22}>
        <h4 style={{color: _props.color, textDecoration: `${_props.lineThroughText ? 'line-through' : ''}`}}
            onClick={() => {
                if (_props.onClickText) _props.onClickText();
            }}>
            {_props.text}
        </h4>
        <span style={{color: '#888'}}>{_props.subtext}</span>
      </Col>
    </Row>
  );
};
