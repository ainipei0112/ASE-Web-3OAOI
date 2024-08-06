import logoSvg from './picture/aseglobal_logo.png'

const Logo = (props) => (
    <img
        alt='Logo'
        src={logoSvg}
        style={{ width: '50px', height: 'auto' }} // 調整圖片的寬度為100像素，高度自動調整
        {...props}
    />
)

export default Logo
