import javax.xml.bind.JAXBContext;
import javax.xml.bind.Marshaller;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

/**
 * @author Frank
 * @date 2024/7/21 16:57
 */
@XmlRootElement
public class Main {
    @XmlElement
    int num = 0;

    public static void main(String[] args)throws Exception {
        JAXBContext context = JAXBContext.newInstance(Main.class);
        Marshaller marshaller = context.createMarshaller();
        marshaller.marshal(new Main(), System.out); // 输出到控制台
    }
}