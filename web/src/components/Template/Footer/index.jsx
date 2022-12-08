import styles from './Footer.module.css'

import FooterMain from './FooterMain'
import FooterButton from './FooterButton'


const Footer = (props) => {
    const { 
        companyInfo={}, 
        style = {}
    } = props
    // console.log('Footer props', companyInfo, style)

    return(
        <footer className={styles.footer}  style={style}>
            <FooterMain companyInfo={companyInfo} style={style}/>
            <FooterButton companyInfo={companyInfo} style={style}/>
        </footer>
    )
}

export default Footer