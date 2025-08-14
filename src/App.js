import javax.swing.*;
import java.awt.*;
import java.awt.event.*;
import java.awt.geom.AffineTransform;

/**
 * DancingCapybara — a tiny Java2D animation.
 * Compile: javac DancingCapybara.java
 * Run:     java DancingCapybara
 */
public class DancingCapybara extends JPanel {
    // Animation timing
    private long startNanos = System.nanoTime();
    private final Timer timer;

    // Music note positions
    private static class Note {
        float x, y, speed, phase;
        Note(float x, float y, float speed, float phase) {
            this.x = x; this.y = y; this.speed = speed; this.phase = phase;
        }
    }
    private final Note[] notes = new Note[10];

    public DancingCapybara() {
        setPreferredSize(new Dimension(900, 600));
        setBackground(new Color(240, 248, 255)); // light, friendly bg

        // Populate floating notes
        for (int i = 0; i < notes.length; i++) {
            float x = 100 + (float)Math.random() * 700f;
            float y = 120 + (float)Math.random() * 220f;
            float speed = 12f + (float)Math.random() * 18f;
            float phase = (float)(Math.random() * Math.PI * 2);
            notes[i] = new Note(x, y, speed, phase);
        }

        // 60 FPS-ish
        timer = new Timer(16, e -> {
            updateNotes();
            repaint();
        });

        // Space toggles pause; R resets phase
        setFocusable(true);
        addKeyListener(new KeyAdapter() {
            boolean paused = false;
            @Override public void keyPressed(KeyEvent e) {
                if (e.getKeyCode() == KeyEvent.VK_SPACE) {
                    paused = !paused;
                    if (paused) timer.stop(); else timer.start();
                } else if (e.getKeyCode() == KeyEvent.VK_R) {
                    startNanos = System.nanoTime();
                }
            }
        });
    }

    private void updateNotes() {
        float dt = 16f / 1000f;
        for (Note n : notes) {
            n.y -= dt * n.speed;
            n.x += (float)Math.sin((System.nanoTime() / 1e9 + n.phase) * 2.0) * 0.4f;
            if (n.y < 30) {
                n.y = 320 + (float)Math.random() * 60f;
                n.x = 120 + (float)Math.random() * 660f;
            }
        }
    }

    private float t() {
        // seconds since start
        return (float)((System.nanoTime() - startNanos) / 1e9);
    }

    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);
        var g2 = (Graphics2D) g.create();
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

        int W = getWidth(), H = getHeight();

        // Floor
        g2.setPaint(new GradientPaint(0, H-180, new Color(225,235,245),
                                      0, H, new Color(205,215,230)));
        g2.fillRect(0, H-180, W, 180);

        // Spotlight circle
        g2.setPaint(new Color(255,255,255,60));
        g2.fillOval(W/2-220, H-260, 440, 220);

        // Floating music notes
        drawNotes(g2);

        // Draw the star: capybara!
        drawCapybara(g2, W/2f, H-220f);

        // Title
        g2.setFont(g2.getFont().deriveFont(Font.BOLD, 18f));
        g2.setColor(new Color(50,60,80,180));
        g2.drawString("Space: pause • R: reset", 18, 26);

        g2.dispose();
    }

    private void drawNotes(Graphics2D g2) {
        g2.setStroke(new BasicStroke(2f, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
        for (Note n : notes) {
            int type = (int)(Math.abs(Math.round(n.phase * 10)) % 3);
            Shape s = switch (type) {
                case 0 -> noteShape(n.x, n.y, 10, 22);
                case 1 -> noteShape(n.x, n.y, 12, 18);
                default -> noteShape(n.x, n.y, 8, 26);
            };
            g2.setColor(new Color(80, 80, 120, 120));
            g2.draw(s);
            g2.setColor(new Color(80, 80, 120, 60));
            g2.fill(s);
        }
    }

    private Shape noteShape(float x, float y, float w, float h) {
        // Simple eighth note using GeneralPath
        var gp = new java.awt.geom.GeneralPath();
        // stem
        gp.moveTo(x, y);
        gp.lineTo(x, y - h);
        // flag
        gp.quadTo(x + w*0.8, y - h*0.7, x, y - h*0.4);
        // head
        gp.append(new java.awt.geom.Ellipse2D.Float(x - w*0.6f, y - w*0.4f, w, w*0.7f), false);
        return gp;
    }

    private void drawCapybara(Graphics2D g2, float cx, float baseY) {
        float t = t();

        // Dance parameters
        float bob = (float)Math.sin(t * 2.2) * 8f;                 // vertical bob
        float wiggle = (float)Math.sin(t * 3.0) * 6f;              // horizontal shimmy
        float headTilt = (float)Math.sin(t * 2.6) * 10f;           // degrees
        float earWiggle = (float)Math.sin(t * 8.0) * 8f;           // degrees
        float footTap = (float)Math.max(0, Math.sin(t * 6.0f)) * 5f;

        // Colors
        Color fur = new Color(170, 120, 75);
        Color furShade = new Color(150, 100, 65);
        Color nose = new Color(90, 65, 55);
        Color belly = new Color(190, 145, 95);

        // Body transform (shimmy + bob)
        AffineTransform saved = g2.getTransform();
        g2.translate(cx + wiggle, baseY + bob);

        // Shadow
        g2.setColor(new Color(0, 0, 0, 35));
        g2.fillOval(-140, 160, 280, 40);

        // Body (big bean)
        g2.setPaint(fur);
        g2.fillRoundRect(-130, 20, 260, 150, 120, 120);

        // Belly patch
        g2.setPaint(belly);
        g2.fillOval(-50, 70, 100, 70);

        // Back leg (left)
        drawLeg(g2, -70, 160, footTap, furShade);
        // Back leg (right)
        drawLeg(g2, 40, 160, -footTap, furShade);

        // Front legs (simple cylinders)
        drawFrontLeg(g2, -80, 140, footTap * 0.5f, fur);
        drawFrontLeg(g2, 70, 140, -footTap * 0.5f, fur);

        // Head
        g2.translate(95, 10);
        g2.rotate(Math.toRadians(headTilt));
        drawHead(g2, fur, nose, earWiggle);

        // Restore
        g2.setTransform(saved);
    }

    private void drawFrontLeg(Graphics2D g2, int x, int y, float tap, Color fur) {
        g2.setColor(fur);
        g2.fillRoundRect(x - 12, y - 10, 24, 46, 20, 20);
        g2.fillRoundRect(x - 16, (int)(y + 26 + tap), 32, 12, 10, 10);
    }

    private void drawLeg(Graphics2D g2, int x, int y, float tap, Color fur) {
        // Thigh
        g2.setColor(fur);
        g2.fillRoundRect(x - 22, y - 40, 44, 48, 22, 22);
        // Shin/foot
        g2.fillRoundRect(x - 26, (int)(y + tap - 4), 52, 16, 12, 12);
        // Toes
        g2.setColor(new Color(90, 60, 50));
        int toeY = (int)(y + tap + 6);
        g2.fillRoundRect(x - 14, toeY, 10, 6, 6, 6);
        g2.fillRoundRect(x - 2, toeY, 10, 6, 6, 6);
        g2.fillRoundRect(x + 10, toeY, 10, 6, 6, 6);
    }

    private void drawHead(Graphics2D g2, Color fur, Color nose, float earWiggleDeg) {
        // Head base
        g2.setColor(fur);
        g2.fillRoundRect(-30, -8, 120, 76, 38, 38);

        // Snout
        g2.fillRoundRect(58, 18, 64, 38, 20, 20);

        // Nose
        g2.setColor(nose);
        g2.fillRoundRect(100, 26, 18, 12, 6, 6);

        // Mouth line
        g2.setStroke(new BasicStroke(2f, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
        g2.drawLine(96, 48, 116, 48);

        // Eye (cute dot)
        g2.setColor(new Color(40, 30, 30));
        g2.fillOval(28, 26, 10, 10);
        g2.setColor(new Color(255, 255, 255, 180));
        g2.fillOval(31, 28, 4, 4);

        // Ear (with wiggle)
        AffineTransform sv = g2.getTransform();
        g2.translate(10, -2);
        g2.rotate(Math.toRadians(earWiggleDeg));
        g2.setColor(fur.darker());
        g2.fillRoundRect(-8, -18, 18, 20, 12, 12);
        g2.setTransform(sv);

        // Cheek blush (for style)
        g2.setColor(new Color(220, 150, 130, 90));
        g2.fillOval(16, 42, 16, 10);
    }

    // ----- Main window setup -----
    private void start() {
        timer.start();
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            JFrame f = new JFrame("Dancing Capybara ✨");
            var panel = new DancingCapybara();
            f.setDefaultCloseOperation(WindowConstants.EXIT_ON_CLOSE);
            f.setContentPane(panel);
            f.pack();
            f.setLocationRelativeTo(null);
            f.setVisible(true);
            panel.requestFocusInWindow();
            panel.start();
        });
    }
}
